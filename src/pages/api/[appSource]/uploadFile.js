import { upload } from "controllers/upload";
import { apiAllowCors, prisma, runMiddleware } from "services";

const handler = async (req, res) => {
  switch (req.method) {
    case "POST":
      await uploadFile(req, res);
      break;
    default:
      res.status(405).send({ message: "Only POST requests allowed" });
      break;
  }
};

export default apiAllowCors(handler);

const uploadFile = async (req, res) => {
  console.log(18, "início da requisição");
  try {
    const { appSource, referenceObjId = "temp" } = req.query;

    if (!appSource)
      return res
        .status(400)
        .json({ status: 400, message: "appSource is required!" });
    console.log(25, "antes do middleware");
    await runMiddleware(req, res, upload.array("files"));
    console.log(27, "depois do middleware");

    const { files } = req;

    const fileCatalogOnDb = await prisma.$transaction(
      files.map(({ size, path, mimetype, originalname, filename }) =>
        prisma.files.create({
          data: {
            fileLength: size.toString(),
            path,
            appSource,
            contentType: mimetype,
            originalName: originalname,
            name: filename,
            referenceObjId,
          },
        })
      )
    );

    return res.status(200).json(fileCatalogOnDb);
  } catch (e) {
    /* handle error */
    console.log(e);
    return res.status(500).json(e.message);
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};
