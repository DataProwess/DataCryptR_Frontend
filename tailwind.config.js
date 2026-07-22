/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        "newgray":"#F5F6FB",
        "newgray1":"#F6F6FA",
        "white":"#ffffff",
        "primary100": "#e78e11",
      //  "primary" : "#5f10f5",
      // "primary":"#DCD9FF",
      "primary":"#E5E9F2",
      "darkpurple":"#8C52FF",
      "purpleshadeO":"#E7DCFC",
      "purpleshadeL":"#EFEAFC",
      "purpleLS":"#BAB4FF",
       "secondary100": "#404040", 
        "secondary" : "#F1F1F1",
        "white" : "#ffffff",
        "pink" : "#ff00ff",
        "lightcolor" : "#8c8c8c",
        "lightorange" : "#ffe0b3",
        "lightorange-100" : "#ffad33",
        "lightgray-100" : "#737373",
        "lightgray-200" : "#b3b3b3",
        "lightorange-300":"#ffad33",
        "lightgray-300" : "#d9d9d9",
        "gray":"#F4F4F4",
        "gray-100" : "#52514e",
        "gray-200" : "#e0dfdc",
        "background" : "#eee",
        "lightgray-400": "#a19f9d",
        "background-100": "#fffdfa",
        "newcolor": "#FCF3E4",
        "loginbg": "#E78000",
        "purpleshade1":"#5e17eb",
        "purpleshade2":"#8c52ff",
        "purpleblue":"#5c5cff",
        "bgpurple1":"#E7DCFC",
        "bgpurple2":"#EFEAFC",
        "purpleshade3":"#B9B3FF",
        "bg-gradient1":"#5f10f5",
        "bg-gradient2":"#cfb7fc",
        "purpleshade9":"#dfcffd",
        "purpleshade10":"#efe7fe",
        //  "bg-gradient1":"#5E18EA",
        // "bg-gradient2":"#F3B1D7"
        "greenshade":"#76E8CD",
        "loginbg":"#DBD9FE"

      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      keyframes: {
        floating: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        floating: 'floating 3s ease-in-out infinite',
      },
      blur: {
        '5px': '20px',
      },
      objectFit: { // Define object-fit utilities
        'contain': 'contain',
        'cover': 'cover',
        'fill': 'fill',
        'none': 'none',
        'scale-down': 'scale-down',
      },
     
      screens: {
        // Width-based breakpoints (already provided)
        xs:'320px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',

        // Custom height-based breakpoints
        'h-sm': { 'raw': '(min-height: 600px)' }, // for small height displays like 1366x768
        'h-md': { 'raw': '(min-height: 738px)' }, // for medium height displays like 1366x738
        'h-lg': { 'raw': '(min-height: 900px)' }, // for larger height displays like 1440x900
        'h-xl': { 'raw': '(min-height: 1050px)' }, // for extra-large height displays like 1680x1050
        'h-2xl': { 'raw': '(min-height: 1080px)' }, // for full HD height displays like 1920x1080

        // Combined width and height breakpoints for specific resolutions
        '2xl-1920x1080': { 'raw': '(min-width: 1920px) and (min-height: 1080px)' }, // 1920x1080
        'xl-1680x1050': { 'raw': '(min-width: 1680px) and (min-height: 1050px)' }, // 1680x1050
        'lg-1440x900': { 'raw': '(min-width: 1440px) and (min-height: 900px)' }, // 1440x900
        'md-1366x768': { 'raw': '(min-width: 1366px) and (min-height: 768px)' }, // 1366x768
        'sm-1280x720': { 'raw': '(min-width: 1280px) and (min-height: 720px)' }, // 1280x720
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};

