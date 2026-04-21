// src/lib/chatTheme.ts

export function getThemeCSS(isDark: boolean): string {
  if (isDark) {
    return `
      --page-bg: #2b2b2b;
      --header-bg: rgba(38,38,38,0.98);
      --header-border: #3a3a3a;
      --sidebar-bg: rgba(35,35,35,0.98);
      --sidebar-border: #3a3a3a;
      --channel-active-bg: #333333;
      --channel-active-border: #4a4a4a;
      --channel-active-text: #f0f0f0;
      --channel-badge-bg: #4a4a4a;
      --channel-badge-text: #e0e0e0;
      --section-label: #555555;
      --online-dot: #6fcf97;
      --online-dot-border: #2b2b2b;
      --username-text: #d0d0d0;
      --sub-text: #666666;
      --typing-text: #aaaaaa;
      --app-title: #f0f0f0;
      --nav-btn-color: #888888;
      --nav-btn-hover-bg: #333333;
      --nav-btn-hover-color: #f0f0f0;
      --channel-bar-bg: rgba(38,38,38,0.98);
      --channel-bar-border: #3a3a3a;
      --channel-name-color: #777777;
      --divider-bg: #3a3a3a;
      --count-color: #555555;
      --msg-area-bg: #2b2b2b;
      --incoming-msg-bg: #333333;
      --incoming-msg-border: #3f3f3f;
      --incoming-msg-color: #d8d8d8;
      --outgoing-msg-bg: #4a4a4a;
      --outgoing-msg-color: #f0f0f0;
      --outgoing-msg-shadow: 0 2px 10px rgba(0,0,0,0.3);
      --incoming-msg-shadow: 0 1px 4px rgba(0,0,0,0.3);
      --sender-name-color: #aaaaaa;
      --timestamp-color: #555555;
      --input-area-bg: rgba(38,38,38,0.98);
      --input-area-border: #3a3a3a;
      --input-wrap-bg: #333333;
      --input-wrap-border: #3f3f3f;
      --input-wrap-focus-shadow: 0 0 0 1px #5a5a5a,0 0 16px rgba(255,255,255,0.04);
      --input-color: #e0e0e0;
      --input-caret: #aaaaaa;
      --send-btn-active-bg: #555555;
      --send-btn-active-shadow: 0 0 12px rgba(255,255,255,0.1);
      --send-btn-inactive-bg: #3a3a3a;
      --credit-color: #3a3a3a;
      --edit-box-bg: #333333;
      --edit-box-border: #555555;
      --edit-box-shadow: 0 0 16px rgba(0,0,0,0.3);
      --edit-text-color: #e0e0e0;
      --cancel-btn-bg: transparent;
      --cancel-btn-color: #888888;
      --cancel-btn-border: #4a4a4a;
      --save-btn-bg: #555555;
      --action-btn-bg: #333333;
      --action-btn-border: #444444;
      --action-btn-hover-bg: #3f3f3f;
      --action-btn-hover-border: #555555;
      --action-btn-del-hover-bg: #3b1a1a;
      --action-btn-del-hover-border: #6b2f2f;
      --typing-bubble-bg: #333333;
      --typing-bubble-border: #444444;
      --typing-bubble-shadow: 0 2px 8px rgba(0,0,0,0.3);
      --logo-gradient: #444444;
      --logo-shadow: 0 0 12px rgba(0,0,0,0.4);
      --profile-link-color: #cccccc;
      --view-profile-color: #aaaaaa;
      --scroll-thumb: #444444;
      --loader-border-color: #3a3a3a;
      --loader-top-color: #888888;
      --loader-text: #666666;
      --toggle-bg: #333333;
      --toggle-border: #4a4a4a;
      --scroll-btn-bg: rgba(51,51,51,0.96);
      --scroll-btn-border: #4a4a4a;
      --scroll-btn-color: #aaaaaa;
      --scroll-btn-shadow: 0 4px 16px rgba(0,0,0,0.4);
      --badge-bg: #555555;
      --mic-btn-bg: #333333;
      --mic-btn-border: #4a4a4a;
      --mic-btn-color: #aaaaaa;
      --mic-active-bg: #7f1d1d;
      --mic-active-shadow: 0 0 16px rgba(220,38,38,0.4);
    `;
  } else {
    return `
      --page-bg: #ffffff;
      --header-bg: rgba(255,255,255,0.98);
      --header-border: #e8e8e8;
      --sidebar-bg: rgba(255,255,255,0.98);
      --sidebar-border: #e8e8e8;
      --channel-active-bg: #f5f5f5;
      --channel-active-border: #e0e0e0;
      --channel-active-text: #1a1a1a;
      --channel-badge-bg: #1a1a1a;
      --channel-badge-text: #ffffff;
      --section-label: #bbbbbb;
      --online-dot: #6fcf97;
      --online-dot-border: #ffffff;
      --username-text: #333333;
      --sub-text: #aaaaaa;
      --typing-text: #666666;
      --app-title: #1a1a1a;
      --nav-btn-color: #777777;
      --nav-btn-hover-bg: #f5f5f5;
      --nav-btn-hover-color: #1a1a1a;
      --channel-bar-bg: rgba(255,255,255,0.98);
      --channel-bar-border: #e8e8e8;
      --channel-name-color: #888888;
      --divider-bg: #e8e8e8;
      --count-color: #bbbbbb;
      --msg-area-bg: #fafafa;
      --incoming-msg-bg: #ffffff;
      --incoming-msg-border: #ebebeb;
      --incoming-msg-color: #1a1a1a;
      --outgoing-msg-bg: #1a1a1a;
      --outgoing-msg-color: #ffffff;
      --outgoing-msg-shadow: 0 2px 10px rgba(0,0,0,0.12);
      --incoming-msg-shadow: 0 1px 4px rgba(0,0,0,0.06);
      --sender-name-color: #555555;
      --timestamp-color: #bbbbbb;
      --input-area-bg: rgba(255,255,255,0.98);
      --input-area-border: #e8e8e8;
      --input-wrap-bg: #f5f5f5;
      --input-wrap-border: #e5e5e5;
      --input-wrap-focus-shadow: 0 0 0 2px #d0d0d0,0 0 12px rgba(0,0,0,0.04);
      --input-color: #1a1a1a;
      --input-caret: #555555;
      --send-btn-active-bg: #1a1a1a;
      --send-btn-active-shadow: 0 0 12px rgba(0,0,0,0.2);
      --send-btn-inactive-bg: #e5e5e5;
      --credit-color: #eeeeee;
      --edit-box-bg: #ffffff;
      --edit-box-border: #cccccc;
      --edit-box-shadow: 0 0 12px rgba(0,0,0,0.08);
      --edit-text-color: #1a1a1a;
      --cancel-btn-bg: transparent;
      --cancel-btn-color: #888888;
      --cancel-btn-border: #e0e0e0;
      --save-btn-bg: #1a1a1a;
      --action-btn-bg: #f9f9f9;
      --action-btn-border: #e5e5e5;
      --action-btn-hover-bg: #f0f0f0;
      --action-btn-hover-border: #d0d0d0;
      --action-btn-del-hover-bg: #fff1f2;
      --action-btn-del-hover-border: #fecdd3;
      --typing-bubble-bg: #ffffff;
      --typing-bubble-border: #ebebeb;
      --typing-bubble-shadow: 0 2px 8px rgba(0,0,0,0.06);
      --logo-gradient: #1a1a1a;
      --logo-shadow: 0 0 12px rgba(0,0,0,0.15);
      --profile-link-color: #333333;
      --view-profile-color: #555555;
      --scroll-thumb: #dddddd;
      --loader-border-color: #e5e5e5;
      --loader-top-color: #555555;
      --loader-text: #aaaaaa;
      --toggle-bg: #f5f5f5;
      --toggle-border: #e0e0e0;
      --scroll-btn-bg: rgba(255,255,255,0.97);
      --scroll-btn-border: #e0e0e0;
      --scroll-btn-color: #555555;
      --scroll-btn-shadow: 0 4px 16px rgba(0,0,0,0.1);
      --badge-bg: #1a1a1a;
      --mic-btn-bg: #f5f5f5;
      --mic-btn-border: #e0e0e0;
      --mic-btn-color: #555555;
      --mic-active-bg: #dc2626;
      --mic-active-shadow: 0 0 16px rgba(220,38,38,0.3);
    `;
  }
}

// Untuk komponen yang butuh object (seperti Avatar, Sidebar, dll)
export function getThemeObject(isDark: boolean) {
  const cssToObject = (cssString: string) => {
    const obj: Record<string, string> = {};
    cssString.split(';').forEach(line => {
      const match = line.trim().match(/^--([\w-]+):\s*(.+)$/);
      if (match) {
        const key = match[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
        obj[key] = match[2];
      }
    });
    return obj;
  };
  
  return cssToObject(getThemeCSS(isDark));
}

// Untuk backward compatibility dengan komponen yang sudah ada
export function getChatTheme(isDark: boolean) {
  const obj = getThemeObject(isDark);
  return {
    pageBg: obj.pageBg || (isDark ? "#2b2b2b" : "#ffffff"),
    headerBg: obj.headerBg || (isDark ? "rgba(38,38,38,0.98)" : "rgba(255,255,255,0.98)"),
    headerBorder: obj.headerBorder || (isDark ? "#3a3a3a" : "#e8e8e8"),
    sidebarBg: obj.sidebarBg || (isDark ? "rgba(35,35,35,0.98)" : "rgba(255,255,255,0.98)"),
    sidebarBorder: obj.sidebarBorder || (isDark ? "#3a3a3a" : "#e8e8e8"),
    channelActiveBg: obj.channelActiveBg || (isDark ? "#333333" : "#f5f5f5"),
    channelActiveBorder: obj.channelActiveBorder || (isDark ? "#4a4a4a" : "#e0e0e0"),
    channelActiveText: obj.channelActiveText || (isDark ? "#f0f0f0" : "#1a1a1a"),
    channelBadgeBg: obj.channelBadgeBg || (isDark ? "#4a4a4a" : "#1a1a1a"),
    channelBadgeText: obj.channelBadgeText || (isDark ? "#e0e0e0" : "#ffffff"),
    sectionLabel: obj.sectionLabel || (isDark ? "#555555" : "#bbbbbb"),
    onlineDot: obj.onlineDot || "#6fcf97",
    onlineDotBorder: obj.onlineDotBorder || (isDark ? "#2b2b2b" : "#ffffff"),
    usernameText: obj.usernameText || (isDark ? "#d0d0d0" : "#333333"),
    subText: obj.subText || (isDark ? "#666666" : "#aaaaaa"),
    typingText: obj.typingText || (isDark ? "#aaaaaa" : "#666666"),
    appTitle: obj.appTitle || (isDark ? "#f0f0f0" : "#1a1a1a"),
    navBtnColor: obj.navBtnColor || (isDark ? "#888888" : "#777777"),
    navBtnHoverBg: obj.navBtnHoverBg || (isDark ? "#333333" : "#f5f5f5"),
    navBtnHoverColor: obj.navBtnHoverColor || (isDark ? "#f0f0f0" : "#1a1a1a"),
    channelBarBg: obj.channelBarBg || (isDark ? "rgba(38,38,38,0.98)" : "rgba(255,255,255,0.98)"),
    channelBarBorder: obj.channelBarBorder || (isDark ? "#3a3a3a" : "#e8e8e8"),
    channelNameColor: obj.channelNameColor || (isDark ? "#777777" : "#888888"),
    dividerBg: obj.dividerBg || (isDark ? "#3a3a3a" : "#e8e8e8"),
    countColor: obj.countColor || (isDark ? "#555555" : "#bbbbbb"),
    msgAreaBg: obj.msgAreaBg || (isDark ? "#2b2b2b" : "#fafafa"),
    incomingMsgBg: obj.incomingMsgBg || (isDark ? "#333333" : "#ffffff"),
    incomingMsgBorder: obj.incomingMsgBorder || (isDark ? "#3f3f3f" : "#ebebeb"),
    incomingMsgColor: obj.incomingMsgColor || (isDark ? "#d8d8d8" : "#1a1a1a"),
    outgoingMsgBg: obj.outgoingMsgBg || (isDark ? "#4a4a4a" : "#1a1a1a"),
    outgoingMsgColor: obj.outgoingMsgColor || (isDark ? "#f0f0f0" : "#ffffff"),
    outgoingMsgShadow: obj.outgoingMsgShadow || (isDark ? "0 2px 10px rgba(0,0,0,0.3)" : "0 2px 10px rgba(0,0,0,0.12)"),
    incomingMsgShadow: obj.incomingMsgShadow || (isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(0,0,0,0.06)"),
    senderNameColor: obj.senderNameColor || (isDark ? "#aaaaaa" : "#555555"),
    timestampColor: obj.timestampColor || (isDark ? "#555555" : "#bbbbbb"),
    inputAreaBg: obj.inputAreaBg || (isDark ? "rgba(38,38,38,0.98)" : "rgba(255,255,255,0.98)"),
    inputAreaBorder: obj.inputAreaBorder || (isDark ? "#3a3a3a" : "#e8e8e8"),
    inputWrapBg: obj.inputWrapBg || (isDark ? "#333333" : "#f5f5f5"),
    inputWrapBorder: obj.inputWrapBorder || (isDark ? "#3f3f3f" : "#e5e5e5"),
    inputWrapFocusShadow: obj.inputWrapFocusShadow || (isDark ? "0 0 0 1px #5a5a5a,0 0 16px rgba(255,255,255,0.04)" : "0 0 0 2px #d0d0d0,0 0 12px rgba(0,0,0,0.04)"),
    inputColor: obj.inputColor || (isDark ? "#e0e0e0" : "#1a1a1a"),
    inputCaret: obj.inputCaret || (isDark ? "#aaaaaa" : "#555555"),
    sendBtnActiveBg: obj.sendBtnActiveBg || (isDark ? "#555555" : "#1a1a1a"),
    sendBtnActiveShadow: obj.sendBtnActiveShadow || (isDark ? "0 0 12px rgba(255,255,255,0.1)" : "0 0 12px rgba(0,0,0,0.2)"),
    sendBtnInactiveBg: obj.sendBtnInactiveBg || (isDark ? "#3a3a3a" : "#e5e5e5"),
    creditColor: obj.creditColor || (isDark ? "#3a3a3a" : "#eeeeee"),
    editBoxBg: obj.editBoxBg || (isDark ? "#333333" : "#ffffff"),
    editBoxBorder: obj.editBoxBorder || (isDark ? "#555555" : "#cccccc"),
    editBoxShadow: obj.editBoxShadow || (isDark ? "0 0 16px rgba(0,0,0,0.3)" : "0 0 12px rgba(0,0,0,0.08)"),
    editTextColor: obj.editTextColor || (isDark ? "#e0e0e0" : "#1a1a1a"),
    cancelBtnBg: obj.cancelBtnBg || "transparent",
    cancelBtnColor: obj.cancelBtnColor || (isDark ? "#888888" : "#888888"),
    cancelBtnBorder: obj.cancelBtnBorder || (isDark ? "#4a4a4a" : "#e0e0e0"),
    saveBtnBg: obj.saveBtnBg || (isDark ? "#555555" : "#1a1a1a"),
    actionBtnBg: obj.actionBtnBg || (isDark ? "#333333" : "#f9f9f9"),
    actionBtnBorder: obj.actionBtnBorder || (isDark ? "#444444" : "#e5e5e5"),
    actionBtnHoverBg: obj.actionBtnHoverBg || (isDark ? "#3f3f3f" : "#f0f0f0"),
    actionBtnHoverBorder: obj.actionBtnHoverBorder || (isDark ? "#555555" : "#d0d0d0"),
    actionBtnDelHoverBg: obj.actionBtnDelHoverBg || (isDark ? "#3b1a1a" : "#fff1f2"),
    actionBtnDelHoverBorder: obj.actionBtnDelHoverBorder || (isDark ? "#6b2f2f" : "#fecdd3"),
    typingBubbleBg: obj.typingBubbleBg || (isDark ? "#333333" : "#ffffff"),
    typingBubbleBorder: obj.typingBubbleBorder || (isDark ? "#444444" : "#ebebeb"),
    typingBubbleShadow: obj.typingBubbleShadow || (isDark ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.06)"),
    logoGradient: obj.logoGradient || (isDark ? "#444444" : "#1a1a1a"),
    logoShadow: obj.logoShadow || (isDark ? "0 0 12px rgba(0,0,0,0.4)" : "0 0 12px rgba(0,0,0,0.15)"),
    profileLinkColor: obj.profileLinkColor || (isDark ? "#cccccc" : "#333333"),
    viewProfileColor: obj.viewProfileColor || (isDark ? "#aaaaaa" : "#555555"),
    scrollThumb: obj.scrollThumb || (isDark ? "#444444" : "#dddddd"),
    loaderBorderColor: obj.loaderBorderColor || (isDark ? "#3a3a3a" : "#e5e5e5"),
    loaderTopColor: obj.loaderTopColor || (isDark ? "#888888" : "#555555"),
    loaderText: obj.loaderText || (isDark ? "#666666" : "#aaaaaa"),
    toggleBg: obj.toggleBg || (isDark ? "#333333" : "#f5f5f5"),
    toggleBorder: obj.toggleBorder || (isDark ? "#4a4a4a" : "#e0e0e0"),
    scrollBtnBg: obj.scrollBtnBg || (isDark ? "rgba(51,51,51,0.96)" : "rgba(255,255,255,0.97)"),
    scrollBtnBorder: obj.scrollBtnBorder || (isDark ? "#4a4a4a" : "#e0e0e0"),
    scrollBtnColor: obj.scrollBtnColor || (isDark ? "#aaaaaa" : "#555555"),
    scrollBtnShadow: obj.scrollBtnShadow || (isDark ? "0 4px 16px rgba(0,0,0,0.4)" : "0 4px 16px rgba(0,0,0,0.1)"),
    badgeBg: obj.badgeBg || (isDark ? "#555555" : "#1a1a1a"),
    micBtnBg: obj.micBtnBg || (isDark ? "#333333" : "#f5f5f5"),
    micBtnBorder: obj.micBtnBorder || (isDark ? "#4a4a4a" : "#e0e0e0"),
    micBtnColor: obj.micBtnColor || (isDark ? "#aaaaaa" : "#555555"),
    micActiveBg: obj.micActiveBg || (isDark ? "#7f1d1d" : "#dc2626"),
    micActiveShadow: obj.micActiveShadow || (isDark ? "0 0 16px rgba(220,38,38,0.4)" : "0 0 16px rgba(220,38,38,0.3)"),
  };
}

export type ChatTheme = ReturnType<typeof getChatTheme>;

// Avatar color palettes
const AVATAR_COLORS: Record<string, { bg: string; text: string }> = {
  A: { bg: "#f0f0f0", text: "#333333" },
  B: { bg: "#e8e8e8", text: "#2a2a2a" },
  C: { bg: "#f5f5f5", text: "#3a3a3a" },
  D: { bg: "#ebebeb", text: "#2e2e2e" },
  E: { bg: "#f2f2f2", text: "#303030" },
  F: { bg: "#e5e5e5", text: "#282828" },
  G: { bg: "#f0f0f0", text: "#353535" },
  H: { bg: "#eeeeee", text: "#2c2c2c" },
  I: { bg: "#f5f5f5", text: "#3a3a3a" },
  J: { bg: "#e8e8e8", text: "#2a2a2a" },
  K: { bg: "#f2f2f2", text: "#303030" },
  L: { bg: "#ebebeb", text: "#2e2e2e" },
  M: { bg: "#f0f0f0", text: "#333333" },
  N: { bg: "#e5e5e5", text: "#282828" },
  O: { bg: "#f5f5f5", text: "#3a3a3a" },
  P: { bg: "#eeeeee", text: "#2c2c2c" },
  Q: { bg: "#f2f2f2", text: "#303030" },
  R: { bg: "#f0f0f0", text: "#353535" },
  S: { bg: "#e8e8e8", text: "#2a2a2a" },
  T: { bg: "#ebebeb", text: "#2e2e2e" },
  U: { bg: "#f5f5f5", text: "#3a3a3a" },
  V: { bg: "#e5e5e5", text: "#282828" },
  W: { bg: "#f0f0f0", text: "#333333" },
  X: { bg: "#eeeeee", text: "#2c2c2c" },
  Y: { bg: "#f2f2f2", text: "#303030" },
  Z: { bg: "#e8e8e8", text: "#2a2a2a" },
};

const AVATAR_COLORS_DARK: Record<string, { bg: string; text: string }> = {
  A: { bg: "#3a3a3a", text: "#d0d0d0" },
  B: { bg: "#424242", text: "#e0e0e0" },
  C: { bg: "#383838", text: "#cccccc" },
  D: { bg: "#404040", text: "#d8d8d8" },
  E: { bg: "#3c3c3c", text: "#d4d4d4" },
  F: { bg: "#444444", text: "#e2e2e2" },
  G: { bg: "#3a3a3a", text: "#d0d0d0" },
  H: { bg: "#424242", text: "#e0e0e0" },
  I: { bg: "#383838", text: "#cccccc" },
  J: { bg: "#404040", text: "#d8d8d8" },
  K: { bg: "#3c3c3c", text: "#d4d4d4" },
  L: { bg: "#444444", text: "#e2e2e2" },
  M: { bg: "#3a3a3a", text: "#d0d0d0" },
  N: { bg: "#424242", text: "#e0e0e0" },
  O: { bg: "#383838", text: "#cccccc" },
  P: { bg: "#404040", text: "#d8d8d8" },
  Q: { bg: "#3c3c3c", text: "#d4d4d4" },
  R: { bg: "#444444", text: "#e2e2e2" },
  S: { bg: "#3a3a3a", text: "#d0d0d0" },
  T: { bg: "#424242", text: "#e0e0e0" },
  U: { bg: "#383838", text: "#cccccc" },
  V: { bg: "#404040", text: "#d8d8d8" },
  W: { bg: "#3c3c3c", text: "#d4d4d4" },
  X: { bg: "#444444", text: "#e2e2e2" },
  Y: { bg: "#3a3a3a", text: "#d0d0d0" },
  Z: { bg: "#424242", text: "#e0e0e0" },
};

export function getAvatarColor(username: string, isDark: boolean) {
  const key = username[0]?.toUpperCase() || "A";
  const colors = isDark ? AVATAR_COLORS_DARK : AVATAR_COLORS;
  return (
    colors[key] ||
    (isDark
      ? { bg: "#3a3a3a", text: "#d0d0d0" }
      : { bg: "#f0f0f0", text: "#333333" })
  );
}

// Formatters
export function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
  
export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}