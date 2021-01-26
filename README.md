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

2 - **/offer (GET)** -> _to get all offers or offers filtered by priceMin, priceMax & sort by_

3 - **/offer/:id (GET)** -> _to get a specific offer_

Required -> offer id

4 - **/offer/update/:id (PUT)** -> _to modify an offer_

Required -> offer id

5 - **/offer/delete/:id (DEL)** -> _to delete an offer_

Required -> offer id

---

### For Payment

One route are available:

**/payment (POST)** -> _to buy an item_
