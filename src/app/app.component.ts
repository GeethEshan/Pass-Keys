import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { fido2Get, fido2Create } from '@ownid/webauthn';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <h1>Passkeys Example</h1>
      <input [(ngModel)]="username" placeholder="Username" />
      <button (click)="registerStart()">Register</button>
      <button (click)="loginStart()">Login</button>
    </div>
  `,
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class AppComponent {
  username: string = '';

  constructor(private http: HttpClient) {}

  async registerStart() {
    try {
      const publicKey = await this.http
        .post('/register/start', { username: this.username })
        .toPromise();
      const fidoData = await fido2Create(publicKey, this.username);
      const response = await this.http
        .post<boolean>('/register/finish', fidoData)
        .toPromise();
      console.log(response);
    } catch (error) {
      console.error('Registration error:', error);
    }
  }

  async loginStart() {
    try {
      const response = await this.http
        .post('/login/start', { username: this.username })
        .toPromise();
      const options = response as PublicKeyCredentialRequestOptions;
      const assertion = await fido2Get(options, this.username);
      await this.http.post('/login/finish', assertion).toPromise();
      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
    }
  }
}
