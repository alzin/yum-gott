# Video API Pagination

The `/api/videos/accepted` endpoint now supports pagination using query parameters.


## Example Usage

### Get first page (10 videos)
```
GET /api/videos/accepted
```

### Get first page with custom limit
```
GET /api/videos/accepted?limit=20
```

### Get next page using cursor
```
GET /api/videos/accepted?limit=10&cursor=2024-01-15T10:30:00.000Z
```

## Response Format

```json
{
  "success": true,
  "message": "Videos retrieved successfully",
  "data": {
    "videos": [
      {
        "id": "uuid",
        "userId": "uuid",
        "publicId": "cloudinary_public_id",
        "secureUrl": "https://res.cloudinary.com/...",
        "restaurantName": "Restaurant Name",
        "phoneNumber": "phone_number",
        "network": "MTN",
        "invoiceImage": "https://s3.amazonaws.com/...",
        "statusVideo": "accepted",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "nextCursor": "2024-01-15T10:30:00.000Z",
      "hasMore": true
    }
  }
}
```

## Pagination Details

- Videos are ordered by `createdAt` in descending order (newest first)
- The cursor is based on the `createdAt` timestamp of the last video in the current page
- When `hasMore` is `false`, there are no more videos to fetch
- When `nextCursor` is `null`, you've reached the end of the results

## Error Responses

### Invalid limit
```json
{
  "success": false,
  "message": "Limit must be a number between 1 and 100"
}
```

