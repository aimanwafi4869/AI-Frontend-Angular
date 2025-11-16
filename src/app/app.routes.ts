import { Routes } from '@angular/router';
import { YoloComponent } from './yolo/yolo.component';
import { QuickdrawComponent } from './quickdraw/quickdraw.component';

export const routes: Routes = [
    {
        path: 'yolo', component: YoloComponent
    },
    {
        path: 'quickdraw', component: QuickdrawComponent
    }
];
