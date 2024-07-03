

# user initiates a nft request
# create json file
# change metadata + include the image

name = "Road"
symbol = "ROAD"
description = "Highly prized road"
metadata = {
  "name": name,
  "symbol": symbol,
  "description": description,
  "seller_fee_basis_points": 700, 
  "image": "https://donewithwork.pythonanywhere.com/nft.png", 
  "attributes": [
    {
      "trait_type": "cypher",
      "value": "Divinity"
    },
    {
      "trait_type": "game",
      "value": "The Old Castle"
    }
  ],
  "properties": {
    "files": [ 
      {
        "uri": "https://donewithwork.pythonanywhere.com/nft.png",
        "type": "image/png"
      }
    ],
    "category": "image",
    "creators": [
      {
        "address": "AvFLeGBFDthzdoct5mHpbUE8ZJdYD4oZXpksoRiws8AG",
        "share": 100
      }
    ]
  }
}