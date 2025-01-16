const emailTemplate = (code: string) => {
  return `<!DOCTYPE html>
<html>
<head>
<title></title>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<style type="text/css">    
    /* CLIENT-SPECIFIC STYLES */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; }

    /* RESET STYLES */
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    table { border-collapse: collapse !important; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }

    /* iOS BLUE LINKS */
    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }
    
    /* MOBILE STYLES */
    @media screen and (max-width:600px){
        h1 {
            font-size: 32px !important;
            line-height: 32px !important;
        }
    }

    /* ANDROID CENTER FIX */
    div[style*="margin: 16px 0;"] { margin: 0 !important; }
</style>

<style type="text/css">

</style>
</head>
<body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">

<!-- HIDDEN PREHEADER TEXT -->
<div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Reset your password
</div>

<table border="0" cellpadding="0" cellspacing="0" width="100%">
    <!-- LOGO -->
    <tr>
        <td bgcolor="#f4f4f4" align="center">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                <tr>
                    <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                       
                    </td>
                </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </td>
    </tr>
    <!-- HERO -->
    <tr>
        <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
                <tr>
                    <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                      <h1 style="font-size: 28px; font-weight: 400; margin: 0; letter-spacing: 0px;">Redefinir senha</h1>
                    </td>
                </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </td>
    </tr>
    <!-- COPY BLOCK -->
    <tr>
        <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
            <!--[if (gte mso 9)|(IE)]>
            <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
            <tr>
            <td align="center" valign="top" width="600">
            <![endif]-->
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;" >
              <!-- COPY -->
              <tr>
                <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                  <p style="margin: 0;">Olá,</p>
                  <p style="margin: 20px 0;">Recebemos uma solicitação para redefinir sua senha. Caso não tenha feito essa solicitação, você pode ignorar este e-mail. Caso contrário, insira o código de redefinição abaixo para continuar o processo:</p>
                </td>
              </tr>
              <!-- CODE BLOCK -->
              <tr>
                <td bgcolor="#ffffff" align="center" style="padding: 20px 30px 40px 30px;">
                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                    <tr>
                      <td align="center">
                        <table border="0" cellspacing="10" cellpadding="0" style="text-align: center;">
                          <tr>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[0]}</td>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[1]}</td>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[2]}</td>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[3]}</td>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[4]}</td>
                            <td style="font-size: 24px; font-family: Helvetica, Arial, sans-serif; color: #333333; text-align: center; border: 1px solid #ddd; padding: 10px; width: 40px;">${code[5]}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- SUPPORT INFO -->
              <tr>
                <td bgcolor="#ffffff" align="left" style="padding: 0px 30px 20px 30px; color: #666666; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                  <p style="margin: 0;">Se você não solicitou uma redefinição de senha, ignore este e-mail ou entre em contato com nossa equipe de suporte.</p>
                </td>
              </tr>
            </table>
            <!--[if (gte mso 9)|(IE)]>
            </td>
            </tr>
            </table>
            <![endif]-->
        </td>
    </tr>
    <!-- FOOTER -->
    <tr>
        <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 20px 30px 20px 30px; color: #666666; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                        <p style="margin: 0;">Você está recebendo este e-mail porque solicitou redefinir sua senha. Caso tenha dúvidas, entre em contato conosco.</p>
                    </td>
                </tr>
                <tr>
                    <td bgcolor="#f4f4f4" align="center" style="padding: 0px 30px 20px 30px; color: #666666; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                        <p style="margin: 0;">© 2025 Centerlight. Todos os direitos reservados.</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>

</body>
</html>
`
}

export default emailTemplate
