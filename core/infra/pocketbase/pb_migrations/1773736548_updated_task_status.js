/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2958607035")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "on_queued",
      "running",
      "submitted",
      "completed"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2958607035")

  // update field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "select2063623452",
    "maxSelect": 1,
    "name": "status",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "on_queued",
      "running",
      "complete",
      "submitted"
    ]
  }))

  return app.save(collection)
})
