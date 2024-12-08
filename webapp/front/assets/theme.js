// bg_color,button_color,button_text_color,hint_color,link_color,text_color
for (const key in Telegram.WebApp.themeParams) {
  document.body.style.setProperty(`--${key}`, Telegram.WebApp.themeParams[key]);
}
