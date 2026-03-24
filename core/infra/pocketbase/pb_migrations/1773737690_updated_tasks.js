/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date1368220840",
    "max": "",
    "min": "",
    "name": "run_at",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "date"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "hidden": false,
    "id": "json325763347",
    "maxSize": 0,
    "name": "result",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2602490748")

  // remove field
  collection.fields.removeById("date1368220840")

  // remove field
  collection.fields.removeById("json325763347")

  return app.save(collection)
})
