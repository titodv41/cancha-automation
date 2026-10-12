# October 12 Instagram delivery diagnosis

The October 11 introduction was approved for 6 PM New York. GitHub's scheduled publishing runner started at 9:10 PM. The old two-hour expiry logic moved the post back to Draft before Meta publication. Its successful workflow status did not represent a publishing receipt. Durable state showed zero Published posts and no uncertain publication to reconcile.

Approved posts now remain eligible until midnight of their scheduled New York day, with fresh source checks before publication. Evening catch-up triggers give delayed runs another chance. Existing content-hash approval, checkpoint-before-publication, one-published-post-per-New-York-day, and refusal to retry uncertain publications remain in place. Previous-day posts require a fresh schedule. GitHub timing remains approximate.

An owner-authorized recovery command schedules the previously approved introduction as October 12's post. Only a durable Published record with a Meta media ID establishes successful publication. Stories remain unavailable until the account is confirmed eligible; performance-based optimization is not yet connected.

Recovery confirmed: October 12 introduction reached Published with Meta media ID `17969795841178863`. The first recovery publishing run stored a Preparing container; the next checked the same container and published it, without creating a duplicate. [Publishing receipt workflow](https://github.com/titodv41/cancha-automation/actions/runs/38309522355). All 53 repository tests passed. The daily schedule still targets 6 PM New York, with catch-up checks later that evening; schedule execution time is not guaranteed.
