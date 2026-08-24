import type {
  LongShortNarrowName,
} from "../../types"

const germanicWeekdays: LongShortNarrowName[] = [
  {
    long: "Sunnons dags",
    short: "Sun",
    narrow: "S",
  },
  {
    long: "Menins dags",
    short: "Men",
    narrow: "M",
  },
  {
    long: "Teiwis dags",
    short: "Tei",
    narrow: "T",
  },
  {
    long: "Wodanis dags",
    short: "Wod",
    narrow: "W",
  },
  {
    long: "Þunaris dags",
    short: "Þun",
    narrow: "Þ",
  },
  {
    long: "Friddjos dags",
    short: "Fri",
    narrow: "F",
  },
  {
    long: "Saturnis dags",
    short: "Sat",
    narrow: "S",
  },
]


const alpineWeekdays: LongShortNarrowName[] = [
  {
    long: "Sunnons dags",
    short: "Sun",
    narrow: "S",
  },
  {
    long: "Menins dags",
    short: "Men",
    narrow: "M",
  },
  {
    long: "Aris dags",
    short: "Ari",
    narrow: "A",
  },
  {
    long: "Midjawiko",
    short: "Mid",
    narrow: "M",
  },
  {
    long: "Paimpte dags",
    short: "Pai",
    narrow: "P",
  },
  {
    long: "Paraskaiwe dags",
    short: "Par",
    narrow: "P",
  },
  {
    long: "Sabbato dags",
    short: "Sab",
    narrow: "S",
  },
]

const greekWeekdays: LongShortNarrowName[] = [
  {
    long: "Fraujins dags",
    short: "Fra",
    narrow: "F",
  },
  {
    long: "Daiwtaira dags",
    short: "Dai",
    narrow: "D",
  },
  {
    long: "Trite dags",
    short: "Tri",
    narrow: "T",
  },
  {
    long: "Taitarte dags",
    short: "Tai",
    narrow: "T",
  },
  {
    long: "Paimpte dags",
    short: "Pai",
    narrow: "P",
  },
  {
    long: "Paraskaiwe dags",
    short: "Par",
    narrow: "P",
  },
  {
    long: "Sabbato dags",
    short: "Sab",
    narrow: "S",
  },
]

const today: LongShortNarrowName = {
  long: "Himma dags",
  short: "Him",
  narrow: "H",
}

const months: LongShortNarrowName[] = [
  {
    long: "Jānuāreis",
    short: "Jān",
    narrow: "J",
  },
  {
    long: "Faibruāreis",
    short: "Fai",
    narrow: "F",
  },
  {
    long: "Mārtjus",
    short: "Mār",
    narrow: "M",
  },
  {
    long: "Apreils",
    short: "Apr",
    narrow: "A",
  },
  {
    long: "Majus",
    short: "Maj",
    narrow: "M",
  },
  {
    long: "Jūnjus",
    short: "Jūn",
    narrow: "J",
  },
  {
    long: "Jūljus",
    short: "Jūl",
    narrow: "J",
  },
  {
    long: "Awgustus",
    short: "Awg",
    narrow: "A",
  },
  {
    long: "Saiptaimbair",
    short: "Sai",
    narrow: "S",
  },
  {
    long: "Auktobair",
    short: "Auk",
    narrow: "A",
  },
  {
    long: "Naubaimbair",
    short: "Nau",
    narrow: "N",
  },
  {
    long: "Daikaimbair",
    short: "Dai",
    narrow: "D",
  },
]

export default {
  today,

  weekdays_germanic: germanicWeekdays,
  weekdays_alpine: alpineWeekdays,
  weekdays_greek: greekWeekdays,

  months,

  ui:
  {
    button_today: "Himma Dags",
    button_month_view: 'Menoþs',
    button_list_view: 'Wiko',
    button_year_view: 'Jer',

    site_title: 'Kalaindāri in Gutrazdai',

    calendars_title: 'Kalaindārjos',
    calendars: {
      gothic: 'Kalaindāri Gutiskai',
      christian: 'Xristeins',
      gothic_saints: 'Weihans Gutiskans'
    }
  }
}