import { Product } from '@wae/types';
import { diffProducts } from './diff-products';

describe('diff-products.ts: diffProducts()', () => {
   it('should detect no difference with the same products input', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const result = diffProducts({ ...product }, product);

      expect(result).toEqual({ isDifferent: false, difference: {} });
   });

   it('should detect no difference with the same fields', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const result = diffProducts(
         { stock: product.stock, name: product.name },
         product,
      );

      expect(result).toEqual({ isDifferent: false, difference: {} });
   });

   it('should detect no difference with empty object', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const result = diffProducts({}, product);

      expect(result).toEqual({ isDifferent: false, difference: {} });
   });

   it('should return difference by all fields', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const anotherProduct: Product = {
         id: 2,
         imgSrc: 'placeholder-2',
         stock: 2000,
         name: 'Name of another product',
         tax: 8,
         externalId: 'external-2',
      };

      const result = diffProducts(anotherProduct, product);

      expect(result).toEqual({
         isDifferent: true,
         difference: anotherProduct,
      });
   });

   it('should return difference by few fields', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const anotherProduct: Partial<Product> = {
         stock: 2000,
         name: 'Name of another product',
      };

      const result = diffProducts(anotherProduct, product);

      expect(result).toEqual({
         isDifferent: true,
         difference: anotherProduct,
      });
   });

   it('should return difference with mixed fields', () => {
      const product: Product = {
         id: 1,
         imgSrc: 'placeholder',
         stock: 1000,
         name: 'Name of product',
         tax: 23,
         externalId: 'external-1',
      };

      const anotherProduct: Partial<Product> = {
         externalId: 'external-1',
         stock: 2000,
         name: 'Name of another product',
         tax: 23,
      };

      const result = diffProducts(anotherProduct, product);

      expect(result).toMatchObject({
         isDifferent: true,
      });

      expect(result.difference).toEqual({
         stock: 2000,
         name: 'Name of another product',
      });
   });
});
