// This is a reviewed public directory, never an automatic projection of form submissions.
export function publicCommunityGroups(rows, {now = new Date()} = {}) {
  if (!Array.isArray(rows)) throw Error('Expected group records');
  const ids = new Set(), invites = new Set(), result = [];
  for (const row of rows) {
    if (row.status !== 'Approved') continue;
    const short = (v, max) => typeof v === 'string' && v.trim().length > 0 && v.length <= max && !/[<>@\r\n]/.test(v);
    const url = new URL(row.inviteUrl);
    if (url.protocol !== 'https:' || url.hostname !== 'chat.whatsapp.com' || url.port || url.username || url.password || url.search || url.hash || !/^\/[A-Za-z0-9_-]{12,64}$/.test(url.pathname)) throw Error('Use a checked WhatsApp group invite');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id || '') || !short(row.name, 90) || !short(row.city, 55) || !short(row.description, 180)) throw Error('Incomplete public group details');
    if (row.adminPermission !== true || row.minimumAge !== 18) throw Error('Public admin permission and adult group policy required');
    const reviewed = /^\d{4}-\d{2}-\d{2}$/.test(row.reviewedOn || '') ? Date.parse(row.reviewedOn + 'T12:00:00Z') : NaN;
    if (!Number.isFinite(reviewed) || reviewed > now.getTime() + 86400000 || now.getTime() - reviewed > 90 * 86400000) throw Error('Group invite needs a recent review');
    if (ids.has(row.id) || invites.has(url.href)) throw Error('Duplicate group or invite');
    ids.add(row.id); invites.add(url.href);
    result.push({id:row.id,name:row.name,city:row.city,description:row.description,inviteUrl:url.href,minimumAge:18,reviewedOn:row.reviewedOn});
  }
  return result.sort((a,b)=>a.city.localeCompare(b.city)||a.name.localeCompare(b.name));
}
