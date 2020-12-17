export const ALL = -1; //0b1;
export const EQUAL = 2; //0b10;
export const NOT_EQUAL = 3; // 0b100;
export const LT_OR_EQUAL = 7; //0b1000;
export const GT_OR_EQUAL = 5; //0b10000;
export const INClUDE = 11; //0b100000;
export const NOT_INCLUDE = 12; //0b1000000;
export const START_WITH = 8; //0b10000000;
export const END_WITH = 9; //0b100000000;
export const IS_NULL = 0; //0b1000000000;
export const IS_NOT_NULL = 1; //0b10000000000;
export const BETWEEN = 13; //0b100000000000;
export const GT_EQUAL = 4; //0b1000000000000;
export const LT_EQUAL = 6; //0b10000000000000;
export const LIKE = 10; //0b100000000000000;
export const NO_LIKE = 14; //0b1000000000000000;
export const CONDITIONS_CATEGORYS = {
  text: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL, LIKE, NO_LIKE, START_WITH, END_WITH],
  date: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL, LT_OR_EQUAL, GT_OR_EQUAL],
  bool: [ALL, IS_NULL, IS_NOT_NULL, EQUAL],
  number: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL, LIKE, NO_LIKE, START_WITH, END_WITH],
  datetime: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL, LT_OR_EQUAL, GT_OR_EQUAL],
  time: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL, LT_OR_EQUAL, GT_OR_EQUAL],
  list: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL],
  boolList: [ALL, IS_NULL, IS_NOT_NULL, EQUAL, NOT_EQUAL],
};

export default [
  {
    value: ALL,
    text: '请选择条件',
  },
  {
    value: IS_NULL,
    text: '为空',
  },
  {
    value: IS_NOT_NULL,
    text: '不为空',
  },
  {
    value: EQUAL,
    text: '等于',
  },
  {
    value: NOT_EQUAL,
    text: '不等于',
  },
  {
    value: LT_OR_EQUAL,
    text: '小于等于',
  },
  {
    value: GT_OR_EQUAL,
    text: '大于等于',
  },
  {
    value: LIKE,
    text: '包含',
  },
  {
    value: NO_LIKE,
    text: '不包含',
  },
  {
    value: START_WITH,
    text: '左等于',
  },
  {
    value: END_WITH,
    text: '右等于',
  },
];
