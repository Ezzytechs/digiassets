const Asset = require('../../models/assets.model');

const calculateAssetDetailsCommand = async (assetIds, session = null) => {
  let assetTotalAmount  = 0;
  const assetDetails = await Promise.all(
    assetIds.map(async (assetId) => {
      const asset = await Asset.findById(assetId).session(session);
      if (!asset) throw new Error(`Asset with ID ${assetId} not found`);
      assetTotalAmount += asset.price;
      return { asset: asset._id };
    })
  );
  return { assetDetails, assetTotalAmount };
};

module.exports = calculateAssetDetailsCommand;
