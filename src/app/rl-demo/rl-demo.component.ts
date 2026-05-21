import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-rl-demo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rl-demo.component.html',
  styleUrl: './rl-demo.component.scss'
})
export class RlDemoComponent implements OnInit {
  color: string = '';
  prevColor: string = '';

  state: string = '';
  reward = 0;
  totalReward = 0;

  action = '';
  blinkOn = true;
  constructor(private http: HttpClient) {}

  ngOnInit() {

    setInterval(() => {
      this.http.get<any>('/api/ai/rl/tick').subscribe(res => {

        const sameColor = this.color === res.color;

        this.prevColor = this.color;
        this.color = res.color;
        this.state = res.state;

        if (this.state === 'Fault') {
          this.reward = res.reward;
          this.action = res.action;
        }
        else {
          if (sameColor) {
            this.reward = 0;
            this.action = 'Stay';
          } else {
            this.reward = res.reward;
            this.action = res.action;
          }
        }

        this.totalReward += this.reward;
      });
    }, 1000);

    setInterval(() => {
      this.blinkOn = !this.blinkOn;
    }, 500);
  }

  // step() {
  //   const action = this.state === 1 ? 1 : this.bestAction();
  //   this.http.post<any>(`/api/ai/rl/step`, { 'action': action }).subscribe(res => {
  //     this.state = res.state;
  //     this.color = res.color;
  //     this.reward = res.reward;
  //     this.qTable = res.q_table;
  //   });
  // }

  // bestAction(): number {
  //   if (!this.qTable.length) return 0;
  //   return this.qTable[this.state][0] > this.qTable[this.state][1] ? 0 : 1;
  // }
}
