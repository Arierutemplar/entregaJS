export const buildPagination = (total, page, limit) => {
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    total,
    totalDocs: total,
    page,
    limit,
    totalPages,
    hasPrevPage: page > 1 && totalPages > 0,
    hasNextPage: page < totalPages
  };
};

export const buildPageLinks = ({ baseUrl, query = {}, page, hasPrevPage, hasNextPage }) => {
  const linkFor = (targetPage) => {
    const params = new URLSearchParams();

    if (query.category) params.set('category', query.category);
    if (typeof query.available === 'boolean') params.set('available', String(query.available));
    params.set('page', String(targetPage));
    params.set('limit', String(query.limit));
    if (query.sortBy) params.set('sortBy', query.sortBy);
    if (query.order) params.set('order', query.order);

    const search = params.toString();
    return search ? `${baseUrl}?${search}` : baseUrl;
  };

  return {
    prevLink: hasPrevPage ? linkFor(page - 1) : null,
    nextLink: hasNextPage ? linkFor(page + 1) : null
  };
};
