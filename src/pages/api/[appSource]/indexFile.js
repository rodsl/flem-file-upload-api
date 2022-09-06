import { apiAllowCors, prisma } from "services";
import fs from "fs";

const handler = async (req, res) => {
  switch (req.method) {
    case "PATCH":
      await indexFile(req, res);
      break;

    default:
      res.status(405).send({ message: "Only PATCH requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);

const indexFile = async (req, res) => {
  try {
    const { fileId } = req.query;
    const { referenceObj } = req.body;

    if (!fileId)
      return res
        .status(400)
        .json({ status: 400, message: "fileId is required!" });
        
    if (!referenceObj)
      return res
        .status(400)
        .json({ status: 400, message: "referenceObj is required!" });

    const getFileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
      },
    });

    if (!getFileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    const oldPatch = getFileDetails.path;

    const destPath = getFileDetails.path
      .replace(getFileDetails.referenceObjId, referenceObj.id)
      .replace(getFileDetails.name, "");

    const newPath = getFileDetails.path.replace(
      getFileDetails.referenceObjId,
      referenceObj.id
    );

    if (!fs.existsSync(destPath)) {
      await fs.promises.mkdir(destPath, { recursive: true });
    }

    const moveFile = await fs.promises.rename(oldPatch, newPath);

    const updateFileDetails = await prisma.files.update({
      data: {
        referenceObjId: referenceObj.id,
        path: newPath,
      },
      where: {
        id: fileId,
      },
    });
    
    return res.status(200).json(updateFileDetails);
  } catch (e) {
    /* handle error */
    console.log(e);
    return res.status(500).json(e.message);
  }
};
