# vinted-api

Create User's account and Offer.

## Usage

### For User

Two routes are available:

1 - **/user/signup (POST)** -> _to create a user_

Required -> | email | username | password |

2 - **/user/login (POST)** -> _to log into API_

Required -> | email | password |

---

### For Offer

Three routes are available:

1 - **/offer/publish (POST)** -> _to create an offer_

Required -> | title |
description |
price |
condition |
city |
brand |
size |
color |
user token |

2 - **/offer (GET)** -> _to get all offers or offers filtered by priceMin, priceMax & sorted by_

3 - **/offer/:id (GET)** -> _to get a specific offer_

Required -> offer id

---

## Todos

- Add a route to update an offer
- Add a route to delete an offer
