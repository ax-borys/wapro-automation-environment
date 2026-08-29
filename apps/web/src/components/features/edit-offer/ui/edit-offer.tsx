import { Button } from '@/components/ui/button';
import {
   EditOfferDialog,
   EditOfferDialogClose,
   EditOfferDialogContent,
   EditOfferDialogEmptyProducts,
   EditOfferDialogFooter,
   EditOfferDialogHeader,
   EditOfferDialogObject,
   EditOfferDialogProduct,
   EditOfferDialogProducts,
   EditOfferDialogSelect,
   EditOfferDialogTitle,
   EditOfferDialogTrigger,
} from '@/components/ui/edit-offer-dialog';
import { Separator } from '@/components/ui/separator';
import { OfferModel } from '@/entities/offer';
import { PlusIcon } from '@phosphor-icons/react';
import { EditIcon } from 'lucide-react';

type OfferData = Pick<OfferModel, 'title' | 'imgSrc' | 'items'>;
export function EditOffer({
   offer,
   trigger,
}: {
   offer: OfferData;
   trigger: React.ReactElement;
}) {
   return (
      <EditOfferDialog>
         <EditOfferDialogTrigger asChild>{trigger}</EditOfferDialogTrigger>
         <EditOfferDialogContent>
            <EditOfferDialogHeader>
               <EditOfferDialogTitle>
                  <EditIcon /> Edit offer
               </EditOfferDialogTitle>
            </EditOfferDialogHeader>
            <EditOfferDialogObject imgSrc={offer.imgSrc} title={offer.title} />
            <Separator />
            <EditOfferDialogProducts>
               {offer.items.length ? (
                  offer.items.map((item) => (
                     <EditOfferDialogProduct
                        key={item.id}
                        name={item.name}
                        quantity={item.quantity}
                     />
                  ))
               ) : (
                  <EditOfferDialogEmptyProducts />
               )}
               <EditOfferDialogSelect />
            </EditOfferDialogProducts>
            <Separator />
            <Button variant={'outline'} className="w-fit">
               <PlusIcon /> Add product
            </Button>
            <EditOfferDialogFooter>
               <EditOfferDialogClose asChild>
                  <Button variant={'outline'}>Cancel</Button>
               </EditOfferDialogClose>
               <EditOfferDialogClose asChild>
                  <Button>Save</Button>
               </EditOfferDialogClose>
            </EditOfferDialogFooter>
         </EditOfferDialogContent>
      </EditOfferDialog>
   );
}
