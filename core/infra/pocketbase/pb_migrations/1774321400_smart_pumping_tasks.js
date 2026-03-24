/// <reference path="../pb_data/types.d.ts" />
migrate(
  (app) => {
    const collection = app.findCollectionByNameOrId('pbc_2602490748');

    // Add device_id field
    collection.fields.addAt(
      2,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'text_device_id',
        max: 0,
        min: 0,
        name: 'device_id',
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      }),
    );

    // Add type field
    collection.fields.addAt(
      3,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'text_type',
        max: 0,
        min: 0,
        name: 'type',
        pattern: '',
        presentable: false,
        primaryKey: false,
        required: true,
        system: false,
        type: 'text',
      }),
    );

    // Add status field
    collection.fields.addAt(
      4,
      new Field({
        autogeneratePattern: '',
        hidden: false,
        id: 'select_status',
        maxSelect: 1,
        name: 'status',
        presentable: false,
        required: true,
        system: false,
        type: 'select',
        values: ['pending', 'processing', 'done', 'failed'],
      }),
    );

    // Update schedule field to payload
    collection.fields.removeById('json1513624059');
    collection.fields.addAt(
      5,
      new Field({
        hidden: false,
        id: 'json_payload',
        maxSize: 0,
        name: 'payload',
        presentable: false,
        required: false,
        system: false,
        type: 'json',
      }),
    );

    // Add scheduled_at field
    collection.fields.addAt(
      6,
      new Field({
        hidden: false,
        id: 'date_scheduled_at',
        max: '',
        min: '',
        name: 'scheduled_at',
        presentable: false,
        required: false,
        system: false,
        type: 'date',
      }),
    );

    // Add started_at field
    collection.fields.addAt(
      7,
      new Field({
        hidden: false,
        id: 'date_started_at',
        max: '',
        min: '',
        name: 'started_at',
        presentable: false,
        required: false,
        system: false,
        type: 'date',
      }),
    );

    // Add completed_at field
    collection.fields.addAt(
      8,
      new Field({
        hidden: false,
        id: 'date_completed_at',
        max: '',
        min: '',
        name: 'completed_at',
        presentable: false,
        required: false,
        system: false,
        type: 'date',
      }),
    );

    // Update rules for dev mode (open access)
    unmarshal(
      {
        createRule: '',
        deleteRule: '',
        listRule: '',
        updateRule: '',
        viewRule: '',
      },
      collection,
    );

    return app.save(collection);
  },
  (app) => {
    // Rollback - restore to previous state
    const collection = app.findCollectionByNameOrId('pbc_2602490748');

    collection.fields.removeById('text_device_id');
    collection.fields.removeById('text_type');
    collection.fields.removeById('select_status');
    collection.fields.removeById('json_payload');
    collection.fields.removeById('date_scheduled_at');
    collection.fields.removeById('date_started_at');
    collection.fields.removeById('date_completed_at');

    return app.save(collection);
  },
);
