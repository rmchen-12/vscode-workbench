import { app, services } from './index';

app.open(() => {
  services.authentication.login(1).then((e: any) => console.log(e));
  services.tickTimer.spm('spm').then(console.log);
  services.authentication.getList();
  
  document.body.innerHTML = '123123';
});
