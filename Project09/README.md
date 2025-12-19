sequenceDiagram
    participant Client
    participant S3 as Amazon S3
    participant KMS as AWS KMS (CMK)

    Client ->> S3: Upload object
    S3 ->> KMS: Request data encryption key
    KMS -->> S3: Return encrypted DEK
    S3 ->> S3: Encrypt object at rest
    S3 -->> Client: Upload successful

    Note over KMS: Automatic key rotation\nEvery 1 year
