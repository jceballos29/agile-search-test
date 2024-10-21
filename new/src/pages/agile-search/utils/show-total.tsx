export const showTotal = (page: number, pageSize: number, total: number) => {
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return ` Showing ${ total > 0 ? start : 0} to ${end} of ${total} results`;
};