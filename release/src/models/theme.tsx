import { createTheme, ThemeProvider } from '@mui/material/styles';

export const enum ST_THEME_COLORS {
  primary = 'primary',
  enabled = 'primary',
  secondary = 'secondary',
  disabled = 'disabled',
  blue = 'blue',
  purple = 'purple',
  green = 'green',
  red = 'red',
  gold = 'gold',
  white = 'white',
  black = 'black',
  grey = 'grey',
}

export const enum ST_COLORS {
    green = '#14F195',
    blue = '#4FA5C4',
    purple = '#9945FF',
    gold = '#FFB600',
    red = '#E4463A',
    black = '#0E1922',
    white = '#EAEAEA',
    grey = '#0D0D0D',
    disabledTextColor = "#757575",
    enabledTextColor = "#CDD2D6",
}


export const STTheme = createTheme({
  typography: {
    fontFamily: [
    //   "Vimland",
      "Roboto",
    //   "LCD"
    ].join(",")
  },
  palette: {
    mode: 'dark',
    primary: {
      main: ST_COLORS.purple
    },
    secondary: {
      main: ST_COLORS.green
    },
    disabled: {
      main: ST_COLORS.grey,
    },
    green: {
        main: ST_COLORS.green,
    },
    blue: {
      main: ST_COLORS.blue,
    },
    purple: {
      main: ST_COLORS.purple,
    },
    gold: {
        main: ST_COLORS.gold,
    },
    red: {
        main: ST_COLORS.red,
    },
    white: {
        main: ST_COLORS.white,
    },
    black: {
        main: ST_COLORS.black,
    },
    grey: {
        main: ST_COLORS.grey,
    },
  } as any
});

export const STThemeProvider = ({ children }: any) => {
    return <ThemeProvider theme={STTheme}>{children}</ThemeProvider>
}