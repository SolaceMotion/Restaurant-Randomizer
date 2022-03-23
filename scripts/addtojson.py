import json

file_path = "../client/resturants.json"

print("Använd kommatecken för att separera värden")
print("Värdena ska matas in i ordningen: [name] [location] [lat] [long] [category]")
amount = int(input("Ange hur många objekt du vill lägga till: "))

count = 0

#Öppna json-fil
with open(file_path, "r", encoding="utf-8") as file:
  stream = file.read()
  #Läs filens innehåll
  contents = json.loads(stream)

#Repetera frågan efter inmatning så många gånger amount anger 
while amount > count:
  inputs = str(input("> ")).split(",")

  #Uppdatera json-filens innehåll
  contents.append({"name": inputs[0], "location": inputs[1], "coords": [float(inputs[2]), float(inputs[3])], "category": inputs[4]})

  #Öppna fil i skrivläge
  with open(file_path, "w", encoding="utf-8") as out:
    #Skriv ändringarna i innehållet
    json.dump(contents, out, indent=4, ensure_ascii=False)

  count+=1
