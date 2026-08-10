-- =====================================================================
-- Created with AI
-- =====================================================================
-- =====================================================================
-- MAGSRC_DodajParagon
-- Procedura zakładająca i zatwierdzająca dokument PARAGON (sprzedaż
-- detaliczna) wraz z powiązanym dokumentem magazynowym WZ.
--
-- Zbudowana na bazie procedur API opisanych w dokumencie:
-- "Procedury SQL obsługi dokumentów w WAPRO Mag. Poradnik wdrożeniowca."
-- (obowiązuje od wersji 8.80.0)
--
-- Kolejność wywołań zgodna z rozdziałem 2 dokumentacji:
--   1. JL_DodajParagonServer_Pre           - nagłówek dok. handlowego
--   2. AP_DodajWTleDokMag_Server           - powiązany dokument WZ
--   3. JL_ZatwierdzPozycje_Server (pętla)  - pozycje paragonu
--   4. JL_SumujDokumentHandlowy_Server     - sumowanie
--   5. JL_PobierzFormatNumeracji_Server    - numeracja
--   6. JL_ZatwierdzDokumentHandlowy_Server - zatwierdzenie dokumentu
--   7. AP_GenerujRozliczenieDokumentuHandlowego - rozliczenie (kasa)
--
-- UWAGA / DO WERYFIKACJI PRZED UŻYCIEM:
--   - Ceny sprzedaży i kod VAT są przekazywane RĘCZNIE dla każdej pozycji
--     (Cena_Netto, Cena_Brutto, Kod_Vat są WYMAGANE - brak pobierania
--     z kartoteki ARTYKUL, aby uniknąć zależności od nazw kolumn cenowych,
--     które różnią się między instalacjami/wersjami WAPRO Mag).
--   - Sygnatura typu dokumentu handlowego dla paragonu (domyślnie 'PA')
--     należy zweryfikować w tabeli TYP_DOKUMENTU_HANDLOWEGO.
--   - Testy proszę wykonywać na bazie testowej/demonstracyjnej.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Typ tabelaryczny (TVP) na pozycje paragonu - utworzyć raz w bazie
-- ---------------------------------------------------------------------
IF TYPE_ID('dbo.TYP_POZYCJE_PARAGONU') IS NULL
BEGIN
    EXEC('
    CREATE TYPE dbo.TYP_POZYCJE_PARAGONU AS TABLE
    (
        Id_Artykulu     NUMERIC       NOT NULL,
        Ilosc           DECIMAL(16,4) NOT NULL,
        Cena_Netto      DECIMAL(14,2) NOT NULL,  -- cena netto podawana ręcznie
        Cena_Brutto     DECIMAL(14,2) NOT NULL,  -- cena brutto podawana ręcznie
        Kod_Vat         CHAR(3)       NOT NULL,  -- kod stawki VAT, np. ''23''
        Rabat           DECIMAL(8,2)  NULL       -- procent rabatu na pozycji, domyślnie 0
    )');
END
GO

-- ---------------------------------------------------------------------
-- 2. Procedura główna
-- ---------------------------------------------------------------------
IF EXISTS (SELECT 1 FROM sysobjects WHERE name = 'MAGSRC_DodajParagon' AND type = 'P')
    DROP PROCEDURE dbo.MAGSRC_DodajParagon
GO

CREATE PROCEDURE dbo.MAGSRC_DodajParagon
    @IdFirmy            NUMERIC,
    @IdMagazynu         NUMERIC,
    @IdKontrahenta      NUMERIC,               -- np. kontrahent "Sprzedaż detaliczna"
    @IdUzytkownika      NUMERIC,
    @IdKasy             INT,                   -- kasa, w której rejestrowana jest wpłata
    @SygnaturaTypuDok   VARCHAR(10) = 'PR',     -- sygnatura typu dok. handlowego dla paragonu
    @Miejsce            VARCHAR(50) = NULL,     -- NULL => pobrane z konfiguracji firmy
    @FormaPlatnosci     VARCHAR(20) = 'gotówka',
    @TerminPlatnosci    INT         = NULL,    -- termin płatności (data wewn.); NULL = data sprzedaży
    @KwotaWplaty        DECIMAL(14,2) = NULL,  -- kwota wpłacona TERAZ; NULL = zapłacono w całości, 0 = nic (odroczone)
    @ObliczanieWg       CHAR(6)     = 'Netto', -- sposób obliczania dokumentu: 'Netto' lub 'Brutto'
    @Pozycje            dbo.TYP_POZYCJE_PARAGONU READONLY,
    @NumerParagonu      VARCHAR(30) OUTPUT,
    @IdDokHandlowego    NUMERIC     OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @errmsg              VARCHAR(500),
            @data                INT,
            @id_typu_han         INT,
            @id_typu_mag         INT,
            @id_pracownika       NUMERIC,
            @id_powst_dok_mag    NUMERIC,

            @IdArtykulu          NUMERIC,
            @Ilosc               DECIMAL(16,4),
            @CenaNetto           DECIMAL(14,2),
            @CenaBrutto          DECIMAL(14,2),
            @KodVat              CHAR(3),
            @Rabat               DECIMAL(8,2),
            @RodzajArtykulu      CHAR(1),
            @SkrotJedn           VARCHAR(10),
            @Przelicznik         DECIMAL(16,6),

            @wartosc_pozycji_netto  DECIMAL(14,2),
            @wartosc_pozycji_brutto DECIMAL(14,2),
            @r_id_poz_dok           NUMERIC,
            @err_cichy              VARCHAR(255),
            @ret                    INT,

            @suma_netto          DECIMAL(16,6),
            @suma_brutto         DECIMAL(16,6),
            @suma_netto_wal      DECIMAL(16,2),
            @suma_brutto_wal     DECIMAL(16,2),

            @num_format          VARCHAR(50),
            @okresnumeracji      TINYINT,
            @num_auto            TINYINT,
            @num_niezalezny      TINYINT;

    SET XACT_ABORT ON;
    SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
    BEGIN TRANSACTION;

    BEGIN TRY

        -- data w wewnętrznym formacie WAPRO (jak w całej dokumentacji)
        SELECT @data = ROUND(CONVERT(REAL, GETDATE()), 0) + 36163;

        -- typ dokumentu handlowego = Paragon
        SELECT @id_typu_han = id_typu
        FROM dbo.TYP_DOKUMENTU_HANDLOWEGO WITH (NOLOCK)
        WHERE sygnatura = @SygnaturaTypuDok AND id_firmy = @IdFirmy;

        IF @id_typu_han IS NULL
        BEGIN
            SET @errmsg = 'Nie znaleziono typu dokumentu handlowego o sygnaturze: ' + @SygnaturaTypuDok;
            RAISERROR(@errmsg, 16, 1);
        END

        -- typ dokumentu magazynowego = WZ (rozchód wewnętrzny paragonu)
        SELECT @id_typu_mag = id_typu
        FROM dbo.typ_dokumentu_magazynowego WITH (NOLOCK)
        WHERE sygnatura = 'WZ' AND id_firmy = @IdFirmy;

        IF @id_typu_mag IS NULL
        BEGIN
            SET @errmsg = 'Nie znaleziono typu dokumentu magazynowego WZ.';
            RAISERROR(@errmsg, 16, 1);
        END

        -- pracownik przypisany do użytkownika (jak w przykładach dokumentacji)
        IF EXISTS (SELECT 1 FROM dbo.pracownik WHERE id_uzytkownika = @IdUzytkownika AND ID_FIRMY = @IdFirmy)
            SELECT @id_pracownika = ISNULL(id_pracownika, 0)
            FROM dbo.pracownik
            WHERE id_uzytkownika = @IdUzytkownika AND ID_FIRMY = @IdFirmy;
        ELSE
            SET @id_pracownika = 0;

        -- miejsce wystawienia z konfiguracji firmy, jeśli nie podano jawnie
        IF @Miejsce IS NULL
            EXEC dbo.AP_PobierzParamKonf 's', @IdFirmy, 'MiejWystFak/Rach', @Miejsce OUTPUT;

        -- =================================================================
        -- 1. Inicjacja nagłówka dokumentu handlowego (paragon) - pkt 2.1.1
        -- =================================================================
        EXEC dbo.JL_DodajParagonServer_Pre
            @IdUzytkownika,
            @IdMagazynu,
            @IdFirmy,
            @data,
            @IdKontrahenta,
            @id_typu_han,
            @Miejsce,
            @IdDokHandlowego OUTPUT,
            0;

        IF @IdDokHandlowego IS NULL OR @IdDokHandlowego = 0
        BEGIN
            SET @errmsg = 'Błąd inicjacji nagłówka paragonu (JL_DodajParagonServer_Pre).';
            RAISERROR(@errmsg, 16, 1);
        END

        -- =================================================================
        -- 2. Automatyczne utworzenie powiązanego dokumentu WZ - pkt 2.1.3
        -- =================================================================
        EXEC dbo.AP_DodajWTleDokMag_Server
            @IdFirmy,
            @IdDokHandlowego,
            @IdMagazynu,
            @data,
            @id_typu_mag,
            @IdKontrahenta,
            0,          -- @przychod
            1,          -- @rozchod
            'WZ',       -- @rodzaj
            'S',        -- @wycena wg cen sprzedaży
            @ObliczanieWg,  -- @brutto_netto
            @IdUzytkownika,
            @id_powst_dok_mag OUTPUT;

        IF @id_powst_dok_mag IS NULL OR @id_powst_dok_mag = 0
        BEGIN
            SET @errmsg = 'Błąd tworzenia dokumentu magazynowego WZ (AP_DodajWTleDokMag_Server).';
            RAISERROR(@errmsg, 16, 1);
        END

        -- =================================================================
        -- 3. Dodanie pozycji paragonu jednocześnie do dok. mag. i handl.
        --    (pkt 2.2 - JL_ZatwierdzPozycje_Server), pętla po @Pozycje
        -- =================================================================
        DECLARE PozycjeParagonu CURSOR LOCAL FAST_FORWARD FOR
            SELECT Id_Artykulu, Ilosc, Cena_Netto, Cena_Brutto, Kod_Vat, ISNULL(Rabat, 0)
            FROM @Pozycje;

        OPEN PozycjeParagonu;
        FETCH NEXT FROM PozycjeParagonu INTO @IdArtykulu, @Ilosc, @CenaNetto, @CenaBrutto, @KodVat, @Rabat;

        WHILE @@FETCH_STATUS = 0
        BEGIN
            -- pobranie tylko rodzaju artykułu i jednostki magazynowania
            -- (cena i VAT przychodzą ręcznie z parametru @Pozycje - patrz TVP)
            SELECT
                @RodzajArtykulu = UPPER(SUBSTRING(a.rodzaj, 1, 1)),
                @SkrotJedn      = j.skrot,
                @Przelicznik    = 1
            FROM dbo.ARTYKUL a WITH (NOLOCK)
            INNER JOIN dbo.jednostka j WITH (NOLOCK) ON a.id_jednostki = j.id_jednostki
            WHERE a.id_artykulu = @IdArtykulu AND a.ID_MAGAZYNU = @IdMagazynu;

            IF @SkrotJedn IS NULL
            BEGIN
                SET @errmsg = 'Nie znaleziono artykułu o id: ' + CAST(@IdArtykulu AS VARCHAR(20));
                RAISERROR(@errmsg, 16, 1);
            END

            EXEC @ret = dbo.JL_ZatwierdzPozycje_Server
                @id_powst_dok_mag,
                @IdDokHandlowego,
                @IdArtykulu,
                'R',                 -- rodzaj_pozycji: rozchód
                @RodzajArtykulu,
                @SkrotJedn,
                @Przelicznik,
                @Ilosc,
                @KodVat,
                @CenaNetto,
                @CenaBrutto,
                0, 0,                -- ceny walutowe (paragon złotówkowy)
                @Rabat, 0,           -- rabat, znak rabatu
                0, 0,                -- rabat2, znak2
                'FIFO',
                1,                   -- ostrzegaj_stan_zero
                @data,
                'S',                 -- wycena wg cen sprzedaży
                0, 0,                -- opakowania wydano/przyjęto
                0,                   -- pozycja_drs
                '',                  -- nr_paczki
                0,                   -- oblicz_wartosc_pozycji
                0,                   -- tryb_rejestracji
                0,                   -- id_poz_dostawy
                @wartosc_pozycji_netto  OUTPUT,
                @wartosc_pozycji_brutto OUTPUT,
                @r_id_poz_dok           OUTPUT,
                1,                   -- tryb_cichy
                @err_cichy              OUTPUT,
                'k';                 -- znacznik ceny: kartotekowa

            IF @ret <> 0
            BEGIN
                SET @errmsg = ISNULL(@err_cichy, 'Błąd zatwierdzania pozycji paragonu.');
                RAISERROR(@errmsg, 16, 1);
            END

            UPDATE dbo.POZYCJA_DOKUMENTU_MAGAZYNOWEGO
            SET ID_POZ_ORYGINALNEJ = @r_id_poz_dok,
                ID_OST_KOREKTY     = @r_id_poz_dok,
                ID_POZ_KORYGOWANEJ = @r_id_poz_dok,
                ID_POW_KOREKTY     = @r_id_poz_dok,
                FLAGA_STANU        = 0
            WHERE id_poz_dok_mag = @r_id_poz_dok;

            FETCH NEXT FROM PozycjeParagonu INTO @IdArtykulu, @Ilosc, @CenaNetto, @CenaBrutto, @KodVat, @Rabat;
        END

        CLOSE PozycjeParagonu;
        DEALLOCATE PozycjeParagonu;

        -- =================================================================
        -- 4. Sumowanie dokumentu handlowego - pkt 2.3.1
        -- =================================================================
        EXEC dbo.JL_SumujDokumentHandlowy_Server
            @IdDokHandlowego,
            's',                 -- sprzedaż
            @ObliczanieWg,
            1,
            @suma_netto      OUTPUT,
            @suma_brutto     OUTPUT,
            @suma_netto_wal  OUTPUT,
            @suma_brutto_wal OUTPUT;

        -- rozstrzygnięcie kwoty wpłaty: NULL = pełna kwota teraz (gotówka),
        -- 0 = nic teraz (odroczone do @TerminPlatnosci), inna wartość = wpłata częściowa
        IF @KwotaWplaty IS NULL SET @KwotaWplaty = @suma_brutto;
        IF @TerminPlatnosci IS NULL SET @TerminPlatnosci = @data;

        -- =================================================================
        -- 5. Numeracja - pkt 2.3.2 (@dokument = 4 dla dok. handlowego)
        -- =================================================================
        EXEC dbo.JL_PobierzFormatNumeracji_Server
            @IdFirmy,
            4,
            @id_typu_han,
            @IdMagazynu,
            @num_format     OUTPUT,
            @okresnumeracji OUTPUT,
            @num_auto       OUTPUT,
            @num_niezalezny OUTPUT;

        -- =================================================================
        -- 6. Zatwierdzenie dokumentu handlowego - pkt 2.3.3
        -- =================================================================
        EXEC dbo.JL_ZatwierdzDokumentHandlowy_Server
            @IdDokHandlowego,
            @id_typu_han,
            '<auto>',
            @num_format,
            @okresnumeracji,
            @num_auto,
            @num_niezalezny,
            @IdFirmy,
            @IdMagazynu,
            @FormaPlatnosci,
            @Miejsce,
            @data,                -- data_wplywu
            @data,                -- data_wystawienia
            @data,                -- data_sprzedazy
            @IdKontrahenta,
            @IdKontrahenta,       -- id_platnika (paragon: nabywca = kontrahent)
            '',                   -- odebral
            '',                   -- uwagi
            0,                    -- rabat na dokumencie
            2,                    -- znak rabatu
            @TerminPlatnosci,     -- termin_plat
            0,                    -- zaliczka
            @KwotaWplaty,         -- wplata_biezaca - kwota wpłacona teraz (może być 0)
            0,                    -- wplata_biezaca_wal
            @suma_netto,
            2,                    -- znak_wn
            @suma_brutto,
            0,                    -- dok_wal (dokument złotówkowy)
            '',                   -- sym_wal
            1,                    -- przelicznik_wal
            0,                    -- data_kursu_wal
            0,                    -- wartosc_netto_wal
            0,                    -- wartosc_brutto_wal
            's',                  -- rodzaj_dok: sprzedaż
            @ObliczanieWg,
            'FIFO',
            0,                    -- przeliczaj_ceny
            0,                    -- id_dok_korygowanego
            1,                    -- fiskalny_ok
            @IdKasy,
            @IdUzytkownika,
            @id_pracownika,
            0,                    -- tryb_rejestracji
            0,                    -- id_rachunku
            1, 1,                 -- potwierdzony_ue, trojstronny_ue
            0,                    -- id_fzal_org
            0;                    -- bez_errmsg

        -- =================================================================
        -- 7. Rozliczenie (wpłata gotówkowa) - pkt 2.3.4
        --    Wywoływane tylko jeśli faktycznie coś wpłacono teraz;
        --    przy @KwotaWplaty = 0 dokument zostaje w pełni odroczony.
        -- =================================================================
        IF @KwotaWplaty > 0
        BEGIN
            EXEC dbo.AP_GenerujRozliczenieDokumentuHandlowego
                @IdFirmy,
                @IdMagazynu,
                @IdDokHandlowego,
                @KwotaWplaty,
                '',                   -- sym_wal
                0,                    -- zaliczka
                @IdKasy,
                0,                    -- id_rachunku
                @IdUzytkownika,
                @id_pracownika,
                2;                    -- znak_wn
        END

        SELECT @NumerParagonu = numer
        FROM dbo.dokument_handlowy
        WHERE id_dokumentu_handlowego = @IdDokHandlowego;

        -- zapis do logu aktywności - pkt 8.4
        EXEC dbo.AP_ZapiszDoLogu
            @IdFirmy, @IdMagazynu, @IdUzytkownika, @IdDokHandlowego,
            'DOK_HAN', 1, 'Paragon dodany procedurą MAGSRC_DodajParagon', 3;

        IF @@TRANCOUNT > 0 COMMIT TRANSACTION;

    END TRY
    BEGIN CATCH
        IF CURSOR_STATUS('local', 'PozycjeParagonu') >= 0
        BEGIN
            CLOSE PozycjeParagonu;
            DEALLOCATE PozycjeParagonu;
        END

        IF @@TRANCOUNT > 0 ROLLBACK TRANSACTION;

        DECLARE @ErrMsgFinal NVARCHAR(4000) = ERROR_MESSAGE();
        SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
        RAISERROR(@ErrMsgFinal, 16, 1);
        RETURN;
    END CATCH

    SET TRANSACTION ISOLATION LEVEL READ COMMITTED;
END
GO


-- =====================================================================
-- Przykładowe wywołanie
-- =====================================================================
/*
DECLARE @poz dbo.TYP_POZYCJE_PARAGONU;

INSERT INTO @poz (Id_Artykulu, Ilosc, Cena_Netto, Cena_Brutto, Kod_Vat, Rabat)
VALUES
    (1001, 2, 8.13,  10.00, '23', 0),
    (1002, 1, 10.00, 12.30, '23', 5);

DECLARE @Numer   VARCHAR(30);
DECLARE @IdDokH  NUMERIC;

-- a) Zapłacone od razu w całości (domyślne zachowanie)
EXEC dbo.MAGSRC_DodajParagon
    @IdFirmy          = 1,
    @IdMagazynu       = 3,
    @IdKontrahenta    = 1,
    @IdUzytkownika    = 3000001,
    @IdKasy           = 1,
    @SygnaturaTypuDok = 'PA',
    @Pozycje          = @poz,
    @NumerParagonu    = @Numer OUTPUT,
    @IdDokHandlowego  = @IdDokH OUTPUT;

-- b) Odroczone w całości, termin płatności za 14 dni, brak wpłaty teraz
EXEC dbo.MAGSRC_DodajParagon
    @IdFirmy          = 1,
    @IdMagazynu       = 3,
    @IdKontrahenta    = 1,
    @IdUzytkownika    = 3000001,
    @IdKasy           = 1,
    @SygnaturaTypuDok = 'PA',
    @TerminPlatnosci  = (SELECT ROUND(CONVERT(REAL, GETDATE()), 0) + 36163 + 14),
    @KwotaWplaty      = 0,
    @Pozycje          = @poz,
    @NumerParagonu    = @Numer OUTPUT,
    @IdDokHandlowego  = @IdDokH OUTPUT;

-- c) Wpłata częściowa (zaliczka) teraz, reszta z terminem za 7 dni
EXEC dbo.MAGSRC_DodajParagon
    @IdFirmy          = 1,
    @IdMagazynu       = 3,
    @IdKontrahenta    = 1,
    @IdUzytkownika    = 3000001,
    @IdKasy           = 1,
    @SygnaturaTypuDok = 'PA',
    @TerminPlatnosci  = (SELECT ROUND(CONVERT(REAL, GETDATE()), 0) + 36163 + 7),
    @KwotaWplaty      = 20.00,
    @Pozycje          = @poz,
    @NumerParagonu    = @Numer OUTPUT,
    @IdDokHandlowego  = @IdDokH OUTPUT;

SELECT @IdDokH AS Id_Dokumentu_Handlowego, @Numer AS Numer_Paragonu;
*/

