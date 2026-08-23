import { IResult } from 'mssql';
import { db } from '../db';
import { toWaproDate } from '../utils/to-wapro-date';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type CreateReceiptOutput = {
   receiptNumber: string;
   id: CreateReceiptInput['id'];
};

export type ReceiptPosition = {
   productId: number;
   quantity: number;
   priceNetto: number;
   priceBrutto: number;
   vatCode: '23' | '8' | '0';
   discount: 0;
};

export type CreateReceiptInput = {
   id: number;
   companyId: number;
   cashRegisterId: number;
   counterPartyId: number;
   userId: number;
   deposit: number;
   paymentDeadline: Date;
   paymentFormat: 'przelew' | 'gotówka' | 'pobranie' | 'przedpłata';
   pricingType: 'Brutto' | 'Netto';
   stockId: number;
   positions: ReceiptPosition[];
};

export async function createReceipt(
   tx: Tx,
   {
      id,
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
   }: CreateReceiptInput,
): Promise<CreateReceiptOutput> {
   let result: CreateReceiptOutput | { id: CreateReceiptInput['id'] } = { id };

   const queryPositions = positions.map((p) => {
      return `(${p.productId},${p.quantity},${p.priceNetto},${p.priceBrutto},'${p.vatCode}', ${p.discount})`;
   });

   try {
      const receiptInfo = await tx.execute<CreateReceiptOutput[]>(`
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

      result = {
         ...result,
         receiptNumber: receiptInfo.recordset[0].receiptNumber,
      };
   } catch (error) {
      console.log('exec error: ', error);
      throw error;
   }

   return result;
}
