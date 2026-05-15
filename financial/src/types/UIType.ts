
import type { ReactElement } from 'react';

export type ButtonData = {
    title: string;
    icon: ReactElement;
    activate: () => void;
}