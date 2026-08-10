import { Tx } from '@wae/types';
import { IRecordSet } from 'mssql';

export function toWaproDate(jsDate = new Date()) {
   const base = Date.UTC(1900, 0, 1); // matches SQL Server real conversion base
   const target = Date.UTC(
      jsDate.getFullYear(),
      jsDate.getMonth(),
      jsDate.getDate(),
   );
   const diffDays = Math.round((target - base) / 86400000);
   return diffDays + 36163;
}

export async function createReceipt(
   tx: Tx,
   {
      companyId,
      stockId,
      counterPartyId,
      userId,
      cashRegisterId,
      pricingType,
      paymentFormat,
      paymentDeadline,
      deposit,
      positions,
   }: {
      pricingType: 'Netto' | 'Brutto';
      positions: {
         productId: Number;
         quantity: Number;
         priceNetto: Number;
         priceBrutto: Number;
         vatCode: string;
         discount: Number;
      }[];
      paymentDeadline: Date;
      companyId: Number;
      stockId: Number;
      userId: Number;
      cashRegisterId: Number;
      paymentFormat: string;
      deposit: Number;
      counterPartyId: Number;
   },
): Promise<IRecordSet<{ [column: string]: any }>> {
   let result = null;

   const queryPositions = positions.map((p) => {
      return `(${p.productId},${p.quantity},${p.priceNetto},${p.priceBrutto},'${p.vatCode}', ${p.discount})`;
   });

   try {
      result = await tx.execute(`
              DECLARE @poz dbo.TYP_POZYCJE_PARAGONU;
              INSERT INTO @poz (Id_Artykulu, Ilosc, Cena_Netto, Cena_Brutto, Kod_Vat, Rabat)
              VALUES ${queryPositions.join(',')};
              DECLARE @Numer  VARCHAR(30);
              DECLARE @IdDokH NUMERIC;

              EXEC dbo.MAGSRC_DodajParagon
                   @IdFirmy          = ${companyId},
                   @IdMagazynu       = ${stockId},
                   @IdKontrahenta    = ${counterPartyId},
                   @IdUzytkownika    = ${userId},
                   @IdKasy           = ${cashRegisterId},
                   @SygnaturaTypuDok = 'PR',
                   @ObliczanieWg     = ${pricingType},
                   @FormaPlatnosci   = ${paymentFormat},
                   @TerminPlatnosci  = ${toWaproDate(paymentDeadline)},
                   @KwotaWplaty      = ${deposit}, 
                   @Pozycje          = @poz,
                   @NumerParagonu    = @Numer OUTPUT,
                   @IdDokHandlowego  = @IdDokH OUTPUT;

              SELECT @IdDokH AS handlDocId, @Numer AS number;
   `);
   } catch (error) {
      console.log('exec error: ', error);
      throw error;
   }

   return result?.recordset;
}
