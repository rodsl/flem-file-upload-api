import multer from "multer";
import fs from "fs";
import { DateTime } from "luxon";
import { prisma } from "services";

export const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const { appSource, referenceObjId = "temp" } = req.query;
      const dest = `./storage/uploads/${appSource}/${DateTime.now()
        .setLocale("pt-BR")
        .toFormat("yyyy/MM/dd")}/${referenceObjId}`;
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      req.dest = dest;
      // req.referenceObjId = referenceObjId;
      // req.fileCatalogList = [];

      return cb(null, dest);
    },
    filename: async (req, file, cb) => {
      const id = DateTime.now().toFormat("HHmmss");
      const { appSource, referenceObjId = "temp" } = req.query;

      return cb(null, `${id}_${file.originalname}`);
    },
  }),

  fileFilter: async (req, file, cb) => {
    file.originalname = Buffer.from(file.originalname, "latin1").toString(
      "utf8"
    );
    const checkFileExists = await prisma.files.findFirst({
      where: {
        name: file.originalname,
      },
    });

    if (checkFileExists !== null) {
      return cb(null, false);
    }

    return cb(null, true);
  },
});
