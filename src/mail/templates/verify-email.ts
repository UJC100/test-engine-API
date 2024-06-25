export function VerifyEmailTemplate(data: number, username) {
    const App_Name = 'Test-Engine'
  return `<div
  style='font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2'
>
  <div style='margin:50px auto;width:70%;padding:20px 0'>
    <div style='border-bottom:1px solid #eee'>
      <a
        href=''
        style='font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600'
      >${App_Name}</a>
    </div>
    <p style='font-size:1.1em'>Hi, ${username}</p>
    <p>Verify your email with the code below. This code
      <b>expires</b>
      in 5 minutes</p>
    <h2> ${data}</h2>
    <p style='font-size:0.9em;'>Regards,<br />${App_Name}</p>
    <hr style='border:none;border-top:1px solid #eee' />
    <div
      style='float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300'
    >
      <p>${App_Name}</p>
    </div>
  </div>
</div>`;
}
