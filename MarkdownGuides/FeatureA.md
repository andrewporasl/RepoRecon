# Feature A: Activity Feed

The Activity Feed provides a high-density, real-time stream of repository events fetched directly from the GitHub API.

## Implementation Details

- **Source**: `backend/github_client.py` using `requests` to poll GitHub's `/events` endpoint.
- **Frontend**: `src/app/activity/page.tsx`
- **Component Stack**:
  - `framer-motion`: Staggered list animations.
  - `lucide-react`: Iconic representation of event types (Push, PR, Issue).
  - `Tailwind CSS`: Custom dark pastel-green styling.

## Data Structure

```json
{
  "id": "event_id",
  "type": "PushEvent | PullRequestEvent | ...",
  "author": "github_username",
  "title": "Commit message or PR title",
  "timestamp": "ISO-8601"
}
```

## Aesthetic Direction
The feed follows a minimalist "Data-Dense" layout, maximizing screen real estate while maintaining legibility through subtle emerald accents and Crimson Pro typography.
