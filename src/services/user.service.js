const DEMO_USER = {
  id: 'u100',
  fullname: 'Guest Seller',
  imgUrl: 'https://i.pravatar.cc/150?img=68',
  level: 'NEW',
  rating: 0,
}

export const userService = {
  getLoggedinUser,
}

function getLoggedinUser() {
  return { ...DEMO_USER }
}
