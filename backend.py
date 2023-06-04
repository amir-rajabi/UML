from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/button', methods=['POST'])
def button():
    if request.method == 'POST':
        value = request.form.get('value')
        print(f"Empfangener Wert: {value}")
        response_text = "Button clicked!"
        return jsonify({'response': response_text})


if __name__ == '__main__':
    print('App started')
    app.run(host='127.0.0.1', port=5001, debug=True)