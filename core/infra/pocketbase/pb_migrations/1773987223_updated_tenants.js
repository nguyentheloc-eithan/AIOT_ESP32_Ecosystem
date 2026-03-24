/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_699394385")

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json3622966325",
    "maxSize": 0,
    "name": "meta",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "json2918445923",
    "maxSize": 0,
    "name": "data",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_699394385")

  // remove field
  collection.fields.removeById("text1579384326")

  // remove field
  collection.fields.removeById("json3622966325")

  // remove field
  collection.fields.removeById("json2918445923")

  return app.save(collection)
})
