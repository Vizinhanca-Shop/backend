export const periodFilters = {
  all: {},
  day: {
    gte: new Date(new Date().setHours(0, 0, 0, 0)),
    lte: new Date(new Date().setHours(23, 59, 59, 999)),
  },
  week: {
    gte: new Date(new Date().setDate(new Date().getDate() - 7)),
  },
  month: {
    gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
  },
  year: {
    gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
  },
}
