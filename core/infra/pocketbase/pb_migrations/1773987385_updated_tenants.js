/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_699394385")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "[a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9]- [a-f0-9][a-f0-9][a-f0-9][a-f0-9]- [a-f0-9][a-f0-9][a-f0-9][a-f0-9]- [a-f0-9][a-f0-9][a-f0-9][a-f0-9]- [a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9][a-f0-9]",
    "hidden": false,
    "id": "text2419269930",
    "max": 0,
    "min": 0,
    "name": "tenant_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_699394385")

  // update field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "[a-z0-9]{30}",
    "hidden": false,
    "id": "text2419269930",
    "max": 0,
    "min": 0,
    "name": "tenant_id",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
})
