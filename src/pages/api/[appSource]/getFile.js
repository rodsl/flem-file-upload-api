import { apiAllowCors, prisma } from "services";
import path from "path";

const handler = async (req, res) => {
  switch (req.method) {
    case "GET":
      await getFile(req, res);
      break;

    default:
      res.status(405).send({ message: "Only GET requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);
const getFile = async (req, res) => {
  try {
    const { fileId, referenceObjId, appSource } = req.query;
    const dest = `./storage/uploads/${appSource}/`;

    
    console.log(25, path.resolve(dest));
    if (!fileId && !referenceObjId)
      return res.status(400).json({
        status: 400,
        message: "fileId or referenceObjId geis required!",
      });

    const fileDetails = await prisma.files.findFirst({
      where: {
        id: fileId,
        referenceObjId: referenceObjId,
      },
    });

    if (!fileDetails)
      return res.status(400).json({ status: 400, message: "file not found!" });

    return res.status(200).json({ fileDetails });
  } catch (e) {
    /* handle error */
    console.log(e);
    return res.status(500).json(e.message);
  }
};
