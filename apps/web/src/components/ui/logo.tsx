'use client';

import { FlowerLotusIcon } from '@phosphor-icons/react';

export function Logo({
   ...props
}: React.ComponentProps<typeof FlowerLotusIcon>) {
   return <FlowerLotusIcon {...props} />;
}
