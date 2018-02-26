install:
	npm install

lint:
	npm run eslint .	


develop:
	npm run webpack -- --watch --env development

build:
	rm -rf dist
	npm run webpack -- -p --env production			