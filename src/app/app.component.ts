import { AfterViewInit, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, AfterViewInit{

  ngOnInit(): void {
    
  }
  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }
  title = 'AI_Hackathon';

  abc():void{
    console.log('abc')
  }
}
