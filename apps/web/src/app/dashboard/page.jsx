import { CogIcon } from 'lucide-react';
export default function Dashboard() {
   return (
      <main className="mx-auto min-w-full bg-background border-border border-x p-4">
         <div className="absolute top-[50%] -translate-y-[50%] left-[50%] -translate-x-[50%] font-medium text-foreground">
            <div className="flex gap-2 text-4xl items-center">
               <CogIcon className="size-10 animate-spin shimmer-reverse" />{' '}
               <h1 className="shimmer">Under construction</h1>
               <CogIcon className="size-10 animate-spin" />
            </div>
            <h2 className="mx-auto w-fit text-muted-foreground leading-8">
               There's no content here yet.
            </h2>
         </div>
      </main>
   );
}
