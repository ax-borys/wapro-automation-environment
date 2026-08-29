'use client';
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
import { OfferModel, ProductModel, useOffersStore } from '@/entities/offer';
import { fetchAllProducts } from '@/entities/product/fetch-all-products';
import { PlusIcon } from '@phosphor-icons/react';
import { produce } from 'immer';
import { EditIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type ProductData = Pick<ProductModel, 'name' | 'id' | 'externalId'>;

type OfferData = Pick<OfferModel, 'title' | 'imgSrc' | 'items' | 'id'>;
export function EditOffer({
   offer,
   trigger,
   onItemAdd,
}: {
   offer: OfferData;
   trigger: React.ReactElement;
   onItemAdd?: (i: (typeof offer.items)[number]) => void;
}) {
   const { replace } = useOffersStore();
   const [addingItem, setAddingItem] = useState<boolean>(false);
   const [productsList, setProductsList] = useState<ProductData[]>([]);
   const [draft, setDraft] = useState<OfferData>({ ...offer });

   const [isOpen, setIsOpen] = useState<boolean>(false);

   const addDraftItem = (item: ProductData) => {
      setDraft(
         produce((draft) => {
            draft.items[item.id] = { quantity: 1, ...item };
         }),
      );
   };

   const removeDraftItem = (itemId: ProductData['id']) => {
      setDraft(
         produce((draft) => {
            delete draft.items[itemId];
         }),
      );
   };

   const increaseDraftQuantity = (itemId: ProductData['id']) => {
      setDraft(
         produce((draft) => {
            draft.items[itemId].quantity += 1;
         }),
      );
   };

   const decreaseDraftQuantity = (itemId: ProductData['id']) => {
      setDraft(
         produce((draft) => {
            draft.items[itemId].quantity = Math.max(
               draft.items[itemId].quantity - 1,
               1,
            );
         }),
      );
   };

   const restore = () => {
      setTimeout(() => setDraft({ ...offer }), 200);
   };

   const cancel = () => {
      restore();
      setIsOpen(false);
   };
   const save = () => {
      setIsOpen(false);
      replace(draft);
   };
   useEffect(() => {
      const getProducts = async () => {
         const products = await fetchAllProducts();
         setProductsList(products);
      };
      getProducts();
   }, []);

   return (
      <EditOfferDialog open={isOpen}>
         <EditOfferDialogTrigger asChild onClick={() => setIsOpen(true)}>
            {trigger}
         </EditOfferDialogTrigger>
         <EditOfferDialogContent onClose={cancel}>
            <EditOfferDialogHeader>
               <EditOfferDialogTitle>
                  <EditIcon /> Edit offer
               </EditOfferDialogTitle>
            </EditOfferDialogHeader>
            <EditOfferDialogObject imgSrc={draft.imgSrc} title={draft.title} />
            <Separator />
            <EditOfferDialogProducts>
               {Object.values(draft.items).length ? (
                  Object.values(draft.items).map((item) => (
                     <EditOfferDialogProduct
                        name={item.name}
                        quantity={item.quantity}
                        key={item.id}
                        onRemove={() => removeDraftItem(item.id)}
                        onQuantityChange={(delta) =>
                           delta < 0
                              ? increaseDraftQuantity(item.id)
                              : decreaseDraftQuantity(item.id)
                        }
                     />
                  ))
               ) : (
                  <EditOfferDialogEmptyProducts />
               )}
               {addingItem ? (
                  <EditOfferDialogSelect<ProductData>
                     onClose={() => setAddingItem(false)}
                     onValueChange={(i) => {
                        if (!i) return;
                        const product = productsList.find((p) => p.id === i.id);

                        setAddingItem(false);
                        if (!product) return;

                        const item = {
                           quantity: 1,
                           ...product,
                        };

                        onItemAdd?.({ ...item });
                        addDraftItem(item);
                     }}
                     autoHighlight
                     items={productsList}
                     itemToStringValue={(i) => i.name}
                     itemToKeyValue={(i) => i.name}
                     defaultOpen
                  />
               ) : null}
            </EditOfferDialogProducts>
            <Separator />
            <Button
               variant={'outline'}
               className="w-fit"
               onClick={() => setAddingItem(true)}
            >
               <PlusIcon /> Add product
            </Button>
            <EditOfferDialogFooter>
               <EditOfferDialogClose asChild>
                  <Button variant={'outline'} onClick={cancel}>
                     Cancel
                  </Button>
               </EditOfferDialogClose>
               <EditOfferDialogClose asChild onClick={save}>
                  <Button>Save</Button>
               </EditOfferDialogClose>
            </EditOfferDialogFooter>
         </EditOfferDialogContent>
      </EditOfferDialog>
   );
}
