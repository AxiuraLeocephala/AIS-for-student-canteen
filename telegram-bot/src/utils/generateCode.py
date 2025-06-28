import os

from barcode import Code128
from barcode.writer import ImageWriter
import re
from PIL import Image

regex = "[\u0400-\u04FF]+"

class GenerateCode:
    defaultTypeIMGCode = "png"
    pathIMGSaved = os.path.join(os.path.dirname(__file__), "codes")
    setRUS = ["А", "К", "Е", "Ц", "П", "М"]
    setENG = ["A", "K", "E", "C", "P", "M"]
    options = {
        "module_width": 0.8,
        "module_height": 25.0,
        "quiet_zone": 3.0,
    }
    
    def code128(self, code: str) -> tuple[str, int]:
        converted_code = self._convert_RUS2ENG(code)
        path_code = self.pathIMGSaved + "\\" + converted_code + "." + self.defaultTypeIMGCode
        with open(path_code, "wb") as f:
            Code128(code="!" + converted_code + "!", writer=ImageWriter()).write(f, self.options)
        with Image.open(path_code) as f:
            crop_image = f.crop((0, 0, 1119, 320))
            crop_image.save(path_code)

        size_code = os.path.getsize(path_code)
        return path_code, size_code
    
    def _convert_RUS2ENG(self, code: str) -> str:
        converted_code = ""
        for char in code:
            if bool(re.search(regex, char, flags=re.UNICODE)):
                converted_code += self.setENG[self.setRUS.index(char)]
            else:
                converted_code += char
        return converted_code

generateCode = GenerateCode()