# IOT-UMCG-G2  

repository voor de groep G2, IoT project voor opdrachtgever UMCG  

# Installatie  

## Python instaleren  

Eerst moet er python worden geïnstalleerd.  
Python voor Windows kan [hier]( https://www.python.org/downloads/) worden gedownload. Je hebt versie 3.12.x nodig, het maakt niet uit welk getal er bij de x staat.  
Na het downloaden moet je het bestand openen en de installatie instructies volgen.  
Voor MacOS en Linux is python al geïnstalleerd.  

## Python modules installeren

Vervolgens moeten de modules die nodig zijn om de webapplicatie te draaien nog geïnstalleerd worden.  
Hiervoor moeten we de terminal/shell openen in de applicatie folder. Dit kan door op de rechtermuisknop te drukken binnen in de folder waar de applicatie staat en dan op ‘open in Windows Terminal’ of ‘Open in Terminal’ te drukken.  
In het scherm dat er nu is moet je het volgende typen:  
Voor Windows:  
> py -m pip install -r requirements.txt  

Voor MacOS en Linux:  
> python3 -m pip install -r requirements.txt  

Als dit gelukt is zijn we klaar om de applicatie te starten.

## Applicatie starten

Om de applicatie te starten moeten we weer in het scherm zijn waar we net zijn geëindigd. Hier moet je het volgende typen:  
Voor Windows:  
> py app.py  

Voor MacOS en Linux:  
> python3 app.py  

En nu zou de webapplicatie moeten draaien.  
Dit kan getest worden door boven in de internetbrowser het volgende te typen en dan op enter te drukken:
> localhost:5000

