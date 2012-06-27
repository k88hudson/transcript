import json

record = []
currentScene = -1
currentParagraph = -1
isSpeaker = 0

filename = "data/macbeth_1.txt"
with open(filename, "r") as basefile:
    for line in basefile.readlines():
        if line.find("SCENE", 0) != -1:
            print line
            currentScene += 1
            record.insert(currentScene, {"scene": line.replace(".\n", ""), "data": []})
            currentParagraph = -1
        elif line.find("[", 0) != -1:
            print line
            record[currentScene]["data"][currentParagraph]["lines"].append(line.replace("\n", ""))
        elif line == "\n" and currentScene > -1:
            currentParagraph += 1
            record[currentScene]["data"].insert(currentParagraph, {"speaker": "", "lines": []})
            isSpeaker = 1
        elif isSpeaker:
            record[currentScene]["data"][currentParagraph]["speaker"] = line.replace(".\n", "")
            isSpeaker = 0
        elif currentParagraph > -1:
            record[currentScene]["data"][currentParagraph]["lines"].append({"time": 0, "text": line.replace("\n", "")})

result = open("results.json", "w")
result.write(json.dumps(record))
result.close()
