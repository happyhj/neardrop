Project_AirDropBox
==================

** 최신 크롬 브라우저만 지원합니다 **

Experiment 1. 흐름제어 없이 파일전송 DEMO

http://labs.heej.net/peerfile0/

- 파일전송은 되지만 송신, 수식측의 속도 비대칭이 발생
- 대용량 (400메가이상) 전송하면 수신측 죽음 

Experiment 2. 흐름제어 (Blob 하나씩만 전송) 파일전송 DEMO

http://labs.heej.net/peerfile1/

- 파일전송이 안정적으로 진행되고 수신자 송신자의 progress가 동기화 되어 진행
- 400MB 파일 전송 성공. 그 이상은 전송시 수신측 크래쉬 
