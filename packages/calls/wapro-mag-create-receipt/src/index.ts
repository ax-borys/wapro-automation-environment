import { Receipt, Tx } from '@wae/types';
import { IRecordSet, IResult } from 'mssql';

function toWaproDate(date = new Date()) {
   const sqlEpoch = Date.UTC(1900, 0, 1);

   const dateOnlyUtc = Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
   );

   const daysSinceSqlEpoch = (dateOnlyUtc - sqlEpoch) / 86400000;
   return Math.round(daysSinceSqlEpoch) + 36163;
}
type ReceiptInfo = {
   receiptNumber: string;
};

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
   }: Receipt,
): Promise<ReceiptInfo> {
   let result: IResult<ReceiptInfo[]> | null = null;

   const queryPositions = positions.map((p) => {
      return `(${p.productId},${p.quantity},${p.priceNetto},${p.priceBrutto},'${p.vatCode}', ${p.discount})`;
   });

   try {
      result = await tx.execute<ReceiptInfo[]>(`
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

              SELECT @IdDokH AS handlDocId, @Numer AS receiptNumber;
      `);
   } catch (error) {
      console.log('exec error: ', error);
      throw error;
   }

   return result.recordset[0];
}
