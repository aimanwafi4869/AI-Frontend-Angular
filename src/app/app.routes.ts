import { Routes } from '@angular/router';
import { YoloComponent } from './yolo/yolo.component';
import { QuickdrawComponent } from './quickdraw/quickdraw.component';
import { HandDetectionComponent } from './hand-detection/hand-detection.component';
import { CvDemoComponent } from './cv-demo/cv-demo.component';
import { RlDemoComponent } from './rl-demo/rl-demo.component';
import { ChessUiComponent } from './chess-ui/chess-ui.component';

export const routes: Routes = [
    {
        path: 'yolo', component: YoloComponent
    },
    {
        path: 'quickdraw', component: QuickdrawComponent
    },
    {
        path: 'hand-detection', component: HandDetectionComponent
    },
    {
        path: 'cv-demo', component: CvDemoComponent
    },
    {
        path: 'rl-demo', component: RlDemoComponent
    },
    {
        path: 'chess', component: ChessUiComponent
    }
];
