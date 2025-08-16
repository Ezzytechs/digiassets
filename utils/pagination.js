exports.paginate = async (Model, options = {}) => {
  const {
    filter = {},
    populate = null,
    sortField = "createdAt",
    sortOrder = -1, 
    select = "",
    page = 1,
    populateSelect=null,
    limit = 20,
  } = options;

  const skip = (page - 1) * limit;

  const totalItems = await Model.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);
const populateData=populate?[{path:populate, select:populateSelect}]:null;
  const data = await Model.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ [sortField]: sortOrder }) // support dynamic sort direction
    .select(select)
    .populate(populateData);

  return {
    data,
    meta: {
      totalItems,
      totalPages,
      currentPage: page,
      perPage: limit,
    },
  };
};
