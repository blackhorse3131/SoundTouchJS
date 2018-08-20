/*
 * SoundTouch JS v0.1.0 audio processing library
 * Copyright (c) Olli Parviainen
 * Copyright (c) Ryan Berdeen
 * Copyright (c) Jakub Fiala
 * Copyright (c) Steve 'Cutter' Blades
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

var get = function get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
};

var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};

var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var FifoSampleBuffer = function () {
    function FifoSampleBuffer() {
        classCallCheck(this, FifoSampleBuffer);
        this._vector = new Float32Array();
        this._position = 0;
        this._frameCount = 0;
    }
    createClass(FifoSampleBuffer, [{
        key: "clear",
        value: function clear() {
            this.receive(this._frameCount);
            this.rewind();
        }
    }, {
        key: "put",
        value: function put(numFrames) {
            this._frameCount += numFrames;
        }
    }, {
        key: "putSamples",
        value: function putSamples(samples, position) {
            var numFrames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            position = position || 0;
            var sourceOffset = position * 2;
            if (!(numFrames >= 0)) {
                numFrames = (samples.length - sourceOffset) / 2;
            }
            var numSamples = numFrames * 2;
            this.ensureCapacity(numFrames + this._frameCount);
            var destOffset = this.endIndex;
            this.vector.set(samples.subarray(sourceOffset, sourceOffset + numSamples), destOffset);
            this._frameCount += numFrames;
        }
    }, {
        key: "putBuffer",
        value: function putBuffer(buffer, position) {
            var numFrames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            position = position || 0;
            if (!(numFrames >= 0)) {
                numFrames = buffer.frameCount - position;
            }
            this.putSamples(buffer.vector, buffer.position + position, numFrames);
        }
    }, {
        key: "receive",
        value: function receive(numFrames) {
            if (!(numFrames >= 0) || numFrames > this._frameCount) {
                numFrames = this.frameCount;
            }
            this._frameCount -= numFrames;
            this._position += numFrames;
        }
    }, {
        key: "receiveSamples",
        value: function receiveSamples(output) {
            var numFrames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var numSamples = numFrames * 2;
            var sourceOffset = this.startIndex;
            output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
            this.receive(numFrames);
        }
    }, {
        key: "extract",
        value: function extract(output) {
            var position = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var numFrames = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            var sourceOffset = this.startIndex + position * 2;
            var numSamples = numFrames * 2;
            output.set(this._vector.subarray(sourceOffset, sourceOffset + numSamples));
        }
    }, {
        key: "ensureCapacity",
        value: function ensureCapacity() {
            var numFrames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var minLength = parseInt(numFrames * 2);
            if (this._vector.length < minLength) {
                var newVector = new Float32Array(minLength);
                newVector.set(this._vector.subarray(this.startIndex, this.endIndex));
                this._vector = newVector;
                this._position = 0;
            } else {
                this.rewind();
            }
        }
    }, {
        key: "ensureAdditionalCapacity",
        value: function ensureAdditionalCapacity() {
            var numFrames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            this.ensureCapacity(this._frameCount + numFrames);
        }
    }, {
        key: "rewind",
        value: function rewind() {
            if (this._position > 0) {
                this._vector.set(this._vector.subarray(this.startIndex, this.endIndex));
                this._position = 0;
            }
        }
    }, {
        key: "vector",
        get: function get$$1() {
            return this._vector;
        }
    }, {
        key: "position",
        get: function get$$1() {
            return this._position;
        }
    }, {
        key: "startIndex",
        get: function get$$1() {
            return this._position * 2;
        }
    }, {
        key: "frameCount",
        get: function get$$1() {
            return this._frameCount;
        }
    }, {
        key: "endIndex",
        get: function get$$1() {
            return (this._position + this._frameCount) * 2;
        }
    }]);
    return FifoSampleBuffer;
}();

var AbstractFifoSamplePipe = function () {
    function AbstractFifoSamplePipe(createBuffers) {
        classCallCheck(this, AbstractFifoSamplePipe);
        if (createBuffers) {
            this._inputBuffer = new FifoSampleBuffer();
            this._outputBuffer = new FifoSampleBuffer();
        } else {
            this._inputBuffer = this._outputBuffer = null;
        }
    }
    createClass(AbstractFifoSamplePipe, [{
        key: 'clear',
        value: function clear() {
            this._inputBuffer.clear();
            this._outputBuffer.clear();
        }
    }, {
        key: 'inputBuffer',
        get: function get$$1() {
            return this._inputBuffer;
        },
        set: function set$$1(inputBuffer) {
            this._inputBuffer = inputBuffer;
        }
    }, {
        key: 'outputBuffer',
        get: function get$$1() {
            return this._outputBuffer;
        },
        set: function set$$1(outputBuffer) {
            this._outputBuffer = outputBuffer;
        }
    }]);
    return AbstractFifoSamplePipe;
}();

var RateTransposer = function (_AbstractFifoSamplePi) {
    inherits(RateTransposer, _AbstractFifoSamplePi);
    function RateTransposer(createBuffers) {
        classCallCheck(this, RateTransposer);
        var _this = possibleConstructorReturn(this, (RateTransposer.__proto__ || Object.getPrototypeOf(RateTransposer)).call(this, createBuffers));
        _this.reset();
        _this._rate = 1;
        return _this;
    }
    createClass(RateTransposer, [{
        key: 'reset',
        value: function reset() {
            this.slopeCount = 0;
            this.prevSampleL = 0;
            this.prevSampleR = 0;
        }
    }, {
        key: 'clone',
        value: function clone() {
            var result = new RateTransposer();
            result.rate = this._rate;
            return result;
        }
    }, {
        key: 'process',
        value: function process() {
            var numFrames = this._inputBuffer.frameCount;
            this._outputBuffer.ensureAdditionalCapacity(numFrames / this._rate + 1);
            var numFramesOutput = this.transpose(numFrames);
            this._inputBuffer.receive();
            this._outputBuffer.put(numFramesOutput);
        }
    }, {
        key: 'transpose',
        value: function transpose() {
            var numFrames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            if (numFrames === 0) {
                return 0;
            }
            var src = this._inputBuffer.vector;
            var srcOffset = this._inputBuffer.startIndex;
            var dest = this._outputBuffer.vector;
            var destOffset = this._outputBuffer.endIndex;
            var used = 0;
            var i = 0;
            while (this.slopeCount < 1.0) {
                dest[destOffset + 2 * i] = (1.0 - this.slopeCount) * this.prevSampleL + this.slopeCount * src[srcOffset];
                dest[destOffset + 2 * i + 1] = (1.0 - this.slopeCount) * this.prevSampleR + this.slopeCount * src[srcOffset + 1];
                i = i + 1;
                this.slopeCount += this._rate;
            }
            this.slopeCount -= 1.0;
            if (numFrames !== 1) {
                out: while (true) {
                    while (this.slopeCount > 1.0) {
                        this.slopeCount -= 1.0;
                        used = used + 1;
                        if (used >= numFrames - 1) {
                            break out;
                        }
                    }
                    var srcIndex = srcOffset + 2 * used;
                    dest[destOffset + 2 * i] = (1.0 - this.slopeCount) * src[srcIndex] + this.slopeCount * src[srcIndex + 2];
                    dest[destOffset + 2 * i + 1] = (1.0 - this.slopeCount) * src[srcIndex + 1] + this.slopeCount * src[srcIndex + 3];
                    i = i + 1;
                    this.slopeCount += this._rate;
                }
            }
            this.prevSampleL = src[srcOffset + 2 * numFrames - 2];
            this.prevSampleR = src[srcOffset + 2 * numFrames - 1];
            return i;
        }
    }, {
        key: 'rate',
        set: function set$$1(rate) {
            this._rate = rate;
        }
    }]);
    return RateTransposer;
}(AbstractFifoSamplePipe);

var FilterSupport = function () {
    function FilterSupport(pipe) {
        classCallCheck(this, FilterSupport);
        this._pipe = pipe;
    }
    createClass(FilterSupport, [{
        key: 'fillInputBuffer',
        value: function fillInputBuffer()              {
            throw new Error('fillInputBuffer() not overridden');
        }
    }, {
        key: 'fillOutputBuffer',
        value: function fillOutputBuffer() {
            var numFrames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            while (this.outputBuffer.frameCount < numFrames) {
                var numInputFrames = 8192 * 2 - this.inputBuffer.frameCount;
                this.fillInputBuffer(numInputFrames);
                if (this.inputBuffer.frameCount < 8192 * 2) {
                    break;
                }
                this._pipe.process();
            }
        }
    }, {
        key: 'clear',
        value: function clear() {
            this._pipe.clear();
        }
    }, {
        key: 'pipe',
        get: function get$$1() {
            return this._pipe;
        }
    }, {
        key: 'inputBuffer',
        get: function get$$1() {
            return this._pipe.inputBuffer;
        }
    }, {
        key: 'outputBuffer',
        get: function get$$1() {
            return this._pipe.outputBuffer;
        }
    }]);
    return FilterSupport;
}();

var SimpleFilter = function (_FilterSupport) {
    inherits(SimpleFilter, _FilterSupport);
    function SimpleFilter(sourceSound, pipe) {
        classCallCheck(this, SimpleFilter);
        var _this = possibleConstructorReturn(this, (SimpleFilter.__proto__ || Object.getPrototypeOf(SimpleFilter)).call(this, pipe));
        _this.sourceSound = sourceSound;
        _this.historyBufferSize = 22050;
        _this._sourcePosition = 0;
        _this.outputBufferPosition = 0;
        _this._position = 0;
        return _this;
    }
    createClass(SimpleFilter, [{
        key: 'fillInputBuffer',
        value: function fillInputBuffer() {
            var numFrames = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var samples = new Float32Array(numFrames * 2);
            var numFramesExtracted = this.sourceSound.extract(samples, numFrames, this._sourcePosition);
            this._sourcePosition += numFramesExtracted;
            this.inputBuffer.putSamples(samples, 0, numFramesExtracted);
        }
    }, {
        key: 'extract',
        value: function extract(target) {
            var numFrames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            this.fillOutputBuffer(this.outputBufferPosition + numFrames);
            var numFramesExtracted = Math.min(numFrames, this.outputBuffer.frameCount - this.outputBufferPosition);
            this.outputBuffer.extract(target, this.outputBufferPosition, numFramesExtracted);
            var currentFrames = this.outputBufferPosition + numFramesExtracted;
            this.outputBufferPosition = Math.min(this.historyBufferSize, currentFrames);
            this.outputBuffer.receive(Math.max(currentFrames - this.historyBufferSize, 0));
            this._position += numFramesExtracted;
            return numFramesExtracted;
        }
    }, {
        key: 'handleSampleData',
        value: function handleSampleData(event) {
            this.extract(event.data, 4096);
        }
    }, {
        key: 'clear',
        value: function clear() {
            get(SimpleFilter.prototype.__proto__ || Object.getPrototypeOf(SimpleFilter.prototype), 'clear', this).call(this);
            this.outputBufferPosition = 0;
        }
    }, {
        key: 'position',
        get: function get$$1() {
            return this._position;
        },
        set: function set$$1(position) {
            if (position > this._position) {
                throw new RangeError('New position may not be greater than current position');
            }
            var newOutputBufferPosition = this.outputBufferPosition - (this._position - position);
            if (newOutputBufferPosition < 0) {
                throw new RangeError('New position falls outside of history buffer');
            }
            this.outputBufferPosition = newOutputBufferPosition;
            this._position = position;
        }
    }, {
        key: 'sourcePosition',
        get: function get$$1() {
            return this._sourcePosition;
        },
        set: function set$$1(sourcePosition) {
            this.clear();
            this._sourcePosition = sourcePosition;
        }
    }]);
    return SimpleFilter;
}(FilterSupport);

var USE_AUTO_SEQUENCE_LEN = 0;
var DEFAULT_SEQUENCE_MS = USE_AUTO_SEQUENCE_LEN;
var USE_AUTO_SEEKWINDOW_LEN = 0;
var DEFAULT_SEEKWINDOW_MS = USE_AUTO_SEEKWINDOW_LEN;
var DEFAULT_OVERLAP_MS = 8;
var _SCAN_OFFSETS = [[124, 186, 248, 310, 372, 434, 496, 558, 620, 682, 744, 806, 868, 930, 992, 1054, 1116, 1178, 1240, 1302, 1364, 1426, 1488, 0], [-100, -75, -50, -25, 25, 50, 75, 100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [-20, -15, -10, -5, 5, 10, 15, 20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [-4, -3, -2, -1, 1, 2, 3, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
var AUTOSEQ_TEMPO_LOW = 0.5;
var AUTOSEQ_TEMPO_TOP = 2.0;
var AUTOSEQ_AT_MIN = 125.0;
var AUTOSEQ_AT_MAX = 50.0;
var AUTOSEQ_K = (AUTOSEQ_AT_MAX - AUTOSEQ_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW);
var AUTOSEQ_C = AUTOSEQ_AT_MIN - AUTOSEQ_K * AUTOSEQ_TEMPO_LOW;
var AUTOSEEK_AT_MIN = 25.0;
var AUTOSEEK_AT_MAX = 15.0;
var AUTOSEEK_K = (AUTOSEEK_AT_MAX - AUTOSEEK_AT_MIN) / (AUTOSEQ_TEMPO_TOP - AUTOSEQ_TEMPO_LOW);
var AUTOSEEK_C = AUTOSEEK_AT_MIN - AUTOSEEK_K * AUTOSEQ_TEMPO_LOW;
var Stretch = function (_AbstractFifoSamplePi) {
    inherits(Stretch, _AbstractFifoSamplePi);
    function Stretch(createBuffers) {
        classCallCheck(this, Stretch);
        var _this = possibleConstructorReturn(this, (Stretch.__proto__ || Object.getPrototypeOf(Stretch)).call(this, createBuffers));
        _this._quickSeek = true;
        _this.midBufferDirty = false;
        _this.midBuffer = null;
        _this.overlapLength = 0;
        _this.autoSeqSetting = true;
        _this.autoSeekSetting = true;
        _this._tempo = 1;
        _this.setParameters(44100, DEFAULT_SEQUENCE_MS, DEFAULT_SEEKWINDOW_MS, DEFAULT_OVERLAP_MS);
        return _this;
    }
    createClass(Stretch, [{
        key: 'clear',
        value: function clear() {
            get(Stretch.prototype.__proto__ || Object.getPrototypeOf(Stretch.prototype), 'clear', this).call(this);
            this.clearMidBuffer();
        }
    }, {
        key: 'clearMidBuffer',
        value: function clearMidBuffer() {
            if (this.midBufferDirty) {
                this.midBufferDirty = false;
                this.midBuffer = null;
            }
        }
    }, {
        key: 'setParameters',
        value: function setParameters(sampleRate, sequenceMs, seekWindowMs, overlapMs) {
            if (sampleRate > 0) {
                this.sampleRate = sampleRate;
            }
            if (overlapMs > 0) {
                this.overlapMs = overlapMs;
            }
            if (sequenceMs > 0) {
                this.sequenceMs = sequenceMs;
                this.autoSeqSetting = false;
            } else {
                this.autoSeqSetting = true;
            }
            if (seekWindowMs > 0) {
                this.seekWindowMs = seekWindowMs;
                this.autoSeekSetting = false;
            } else {
                this.autoSeekSetting = true;
            }
            this.calculateSequenceParameters();
            this.calculateOverlapLength(this.overlapMs);
            this.tempo = this._tempo;
        }
    }, {
        key: 'calculateOverlapLength',
        value: function calculateOverlapLength() {
            var overlapInMsec = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
            var newOvl = void 0;
            newOvl = this.sampleRate * overlapInMsec / 1000;
            newOvl = newOvl < 16 ? 16 : newOvl;
            newOvl -= newOvl % 8;
            this.overlapLength = newOvl;
            this.refMidBuffer = new Float32Array(this.overlapLength * 2);
            this.midBuffer = new Float32Array(this.overlapLength * 2);
        }
    }, {
        key: 'checkLimits',
        value: function checkLimits(x, mi, ma) {
            return x < mi ? mi : x > ma ? ma : x;
        }
    }, {
        key: 'calculateSequenceParameters',
        value: function calculateSequenceParameters() {
            var seq = void 0;
            var seek = void 0;
            if (this.autoSeqSetting) {
                seq = AUTOSEQ_C + AUTOSEQ_K * this._tempo;
                seq = this.checkLimits(seq, AUTOSEQ_AT_MAX, AUTOSEQ_AT_MIN);
                this.sequenceMs = Math.floor(seq + 0.5);
            }
            if (this.autoSeekSetting) {
                seek = AUTOSEEK_C + AUTOSEEK_K * this._tempo;
                seek = this.checkLimits(seek, AUTOSEEK_AT_MAX, AUTOSEEK_AT_MIN);
                this.seekWindowMs = Math.floor(seek + 0.5);
            }
            this.seekWindowLength = Math.floor(this.sampleRate * this.sequenceMs / 1000);
            this.seekLength = Math.floor(this.sampleRate * this.seekWindowMs / 1000);
        }
    }, {
        key: 'clone',
        value: function clone() {
            var result = new Stretch();
            result.tempo = this._tempo;
            result.setParameters(this.sampleRate, this.sequenceMs, this.seekWindowMs, this.overlapMs);
            return result;
        }
    }, {
        key: 'seekBestOverlapPosition',
        value: function seekBestOverlapPosition() {
            return this._quickSeek ? this.seekBestOverlapPositionStereoQuick() : this.seekBestOverlapPositionStereo();
        }
    }, {
        key: 'seekBestOverlapPositionStereo',
        value: function seekBestOverlapPositionStereo() {
            var bestOffset = void 0;
            var bestCorrelation = void 0;
            var correlation = void 0;
            var i = 0;
            this.preCalculateCorrelationReferenceStereo();
            bestOffset = 0;
            bestCorrelation = Number.MIN_VALUE;
            for (; i < this.seekLength; i = i + 1) {
                correlation = this.calculateCrossCorrelationStereo(2 * i, this.refMidBuffer);
                if (correlation > bestCorrelation) {
                    bestCorrelation = correlation;
                    bestOffset = i;
                }
            }
            return bestOffset;
        }
    }, {
        key: 'seekBestOverlapPositionStereoQuick',
        value: function seekBestOverlapPositionStereoQuick() {
            var bestOffset = void 0;
            var bestCorrelation = void 0;
            var correlation = void 0;
            var scanCount = 0;
            var correlationOffset = void 0;
            var tempOffset = void 0;
            this.preCalculateCorrelationReferenceStereo();
            bestCorrelation = Number.MIN_VALUE;
            bestOffset = 0;
            correlationOffset = 0;
            tempOffset = 0;
            for (; scanCount < 4; scanCount = scanCount + 1) {
                var j = 0;
                while (_SCAN_OFFSETS[scanCount][j]) {
                    tempOffset = correlationOffset + _SCAN_OFFSETS[scanCount][j];
                    if (tempOffset >= this.seekLength) {
                        break;
                    }
                    correlation = this.calculateCrossCorrelationStereo(2 * tempOffset, this.refMidBuffer);
                    if (correlation > bestCorrelation) {
                        bestCorrelation = correlation;
                        bestOffset = tempOffset;
                    }
                    j = j + 1;
                }
                correlationOffset = bestOffset;
            }
            return bestOffset;
        }
    }, {
        key: 'preCalculateCorrelationReferenceStereo',
        value: function preCalculateCorrelationReferenceStereo() {
            var i = 0;
            var context = void 0;
            var temp = void 0;
            for (; i < this.overlapLength; i = i + 1) {
                temp = i * (this.overlapLength - i);
                context = i * 2;
                this.refMidBuffer[context] = this.midBuffer[context] * temp;
                this.refMidBuffer[context + 1] = this.midBuffer[context + 1] * temp;
            }
        }
    }, {
        key: 'calculateCrossCorrelationStereo',
        value: function calculateCrossCorrelationStereo(mixingPosition, compare) {
            var mixing = this._inputBuffer.vector;
            mixingPosition += this._inputBuffer.startIndex;
            var correlation = 0;
            var i = 2;
            var calcLength = 2 * this.overlapLength;
            var mixingOffset = void 0;
            for (; i < calcLength; i = i + 2) {
                mixingOffset = i + mixingPosition;
                correlation += mixing[mixingOffset] * compare[i] + mixing[mixingOffset + 1] * compare[i + 1];
            }
            return correlation;
        }
    }, {
        key: 'overlap',
        value: function overlap(overlapPosition) {
            this.overlapStereo(2 * overlapPosition);
        }
    }, {
        key: 'overlapStereo',
        value: function overlapStereo(inputPosition) {
            var input = this._inputBuffer.vector;
            inputPosition += this._inputBuffer.startIndex;
            var output = this._outputBuffer.vector;
            var outputPosition = this._outputBuffer.endIndex;
            var i = 0;
            var context = void 0;
            var tempFrame = void 0;
            var frameScale = 1 / this.overlapLength;
            var fi = void 0;
            var inputOffset = void 0;
            var outputOffset = void 0;
            for (; i < this.overlapLength; i = i + 1) {
                tempFrame = (this.overlapLength - i) * frameScale;
                fi = i * frameScale;
                context = 2 * i;
                inputOffset = context + inputPosition;
                outputOffset = context + outputPosition;
                output[outputOffset + 0] = input[inputOffset + 0] * fi + this.midBuffer[context + 0] * tempFrame;
                output[outputOffset + 1] = input[inputOffset + 1] * fi + this.midBuffer[context + 1] * tempFrame;
            }
        }
    }, {
        key: 'process',
        value: function process() {
            var offset = void 0;
            var temp = void 0;
            var overlapSkip = void 0;
            if (this.midBuffer === null) {
                if (this._inputBuffer.frameCount < this.overlapLength) {
                    return;
                }
                this.midBuffer = new Float32Array(this.overlapLength * 2);
                this._inputBuffer.receiveSamples(this.midBuffer, this.overlapLength);
            }
            while (this._inputBuffer.frameCount >= this.sampleReq) {
                offset = this.seekBestOverlapPosition();
                this._outputBuffer.ensureAdditionalCapacity(this.overlapLength);
                this.overlap(Math.floor(offset));
                this._outputBuffer.put(this.overlapLength);
                temp = this.seekWindowLength - 2 * this.overlapLength;
                if (temp > 0) {
                    this._outputBuffer.putBuffer(this._inputBuffer, offset + this.overlapLength, temp);
                }
                var start = this._inputBuffer.startIndex + 2 * (offset + this.seekWindowLength - this.overlapLength);
                this.midBuffer.set(this._inputBuffer.vector.subarray(start, start + 2 * this.overlapLength));
                this.skipFract += this.nominalSkip;
                overlapSkip = Math.floor(this.skipFract);
                this.skipFract -= overlapSkip;
                this._inputBuffer.receive(overlapSkip);
            }
        }
    }, {
        key: 'tempo',
        set: function set$$1(newTempo) {
            var intskip = void 0;
            this._tempo = newTempo;
            this.calculateSequenceParameters();
            this.nominalSkip = this._tempo * (this.seekWindowLength - this.overlapLength);
            this.skipFract = 0;
            intskip = Math.floor(this.nominalSkip + 0.5);
            this.sampleReq = Math.max(intskip + this.overlapLength, this.seekWindowLength) + this.seekLength;
        },
        get: function get$$1() {
            return this._tempo;
        }
    }, {
        key: 'inputChunkSize',
        get: function get$$1() {
            return this.sampleReq;
        }
    }, {
        key: 'outputChunkSize',
        get: function get$$1() {
            return this.overlapLength + Math.max(0, this.seekWindowLength - 2 * this.overlapLength);
        }
    }, {
        key: 'quickSeek',
        set: function set$$1(enable) {
            this._quickSeek = enable;
        }
    }]);
    return Stretch;
}(AbstractFifoSamplePipe);

var testFloatEqual = function testFloatEqual(a, b) {
    return (a > b ? a - b : b - a) > 1e-10;
};

var SoundTouch = function () {
    function SoundTouch() {
        classCallCheck(this, SoundTouch);
        this.transposer = new RateTransposer(false);
        this.stretch = new Stretch(false);
        this._inputBuffer = new FifoSampleBuffer();
        this._intermediateBuffer = new FifoSampleBuffer();
        this._outputBuffer = new FifoSampleBuffer();
        this._rate = 0;
        this._tempo = 0;
        this.virtualPitch = 1.0;
        this.virtualRate = 1.0;
        this.virtualTempo = 1.0;
        this.calculateEffectiveRateAndTempo();
    }
    createClass(SoundTouch, [{
        key: 'clear',
        value: function clear() {
            this.transposer.clear();
            this.stretch.clear();
        }
    }, {
        key: 'clone',
        value: function clone() {
            var result = new SoundTouch();
            result.rate = this.rate;
            result.tempo = this.tempo;
            return result;
        }
    }, {
        key: 'calculateEffectiveRateAndTempo',
        value: function calculateEffectiveRateAndTempo() {
            var previousTempo = this._tempo;
            var previousRate = this._rate;
            this._tempo = this.virtualTempo / this.virtualPitch;
            this._rate = this.virtualRate * this.virtualPitch;
            if (testFloatEqual(this._tempo, previousTempo)) {
                this.stretch.tempo = this._tempo;
            }
            if (testFloatEqual(this._rate, previousRate)) {
                this.transposer.rate = this._rate;
            }
            if (this._rate > 1.0) {
                if (this._outputBuffer != this.transposer.outputBuffer) {
                    this.stretch.inputBuffer = this._inputBuffer;
                    this.stretch.outputBuffer = this._intermediateBuffer;
                    this.transposer.inputBuffer = this._intermediateBuffer;
                    this.transposer.outputBuffer = this._outputBuffer;
                }
            } else {
                if (this._outputBuffer != this.stretch.outputBuffer) {
                    this.transposer.inputBuffer = this._inputBuffer;
                    this.transposer.outputBuffer = this._intermediateBuffer;
                    this.stretch.inputBuffer = this._intermediateBuffer;
                    this.stretch.outputBuffer = this._outputBuffer;
                }
            }
        }
    }, {
        key: 'process',
        value: function process() {
            if (this._rate > 1.0) {
                this.stretch.process();
                this.transposer.process();
            } else {
                this.transposer.process();
                this.stretch.process();
            }
        }
    }, {
        key: 'rate',
        get: function get$$1() {
            return this._rate;
        },
        set: function set$$1(rate) {
            this.virtualRate = rate;
            this.calculateEffectiveRateAndTempo();
        }
    }, {
        key: 'rateChange',
        set: function set$$1(rateChange) {
            this._rate = 1.0 + 0.01 * rateChange;
        }
    }, {
        key: 'tempo',
        get: function get$$1() {
            return this._tempo;
        },
        set: function set$$1(tempo) {
            this.virtualTempo = tempo;
            this.calculateEffectiveRateAndTempo();
        }
    }, {
        key: 'tempoChange',
        set: function set$$1(tempoChange) {
            this.tempo = 1.0 + 0.01 * tempoChange;
        }
    }, {
        key: 'pitch',
        set: function set$$1(pitch) {
            this.virtualPitch = pitch;
            this.calculateEffectiveRateAndTempo();
        }
    }, {
        key: 'pitchOctaves',
        set: function set$$1(pitchOctaves) {
            this.pitch = Math.exp(0.69314718056 * pitchOctaves);
            this.calculateEffectiveRateAndTempo();
        }
    }, {
        key: 'pitchSemitones',
        set: function set$$1(pitchSemitones) {
            this.pitchOctaves = pitchSemitones / 12.0;
        }
    }, {
        key: 'inputBuffer',
        get: function get$$1() {
            return this._inputBuffer;
        }
    }, {
        key: 'outputBuffer',
        get: function get$$1() {
            return this._outputBuffer;
        }
    }]);
    return SoundTouch;
}();

var WebAudioBufferSource = function () {
    function WebAudioBufferSource(buffer) {
        classCallCheck(this, WebAudioBufferSource);
        this.buffer = buffer;
        this._position = 0;
    }
    createClass(WebAudioBufferSource, [{
        key: "extract",
        value: function extract(target) {
            var numFrames = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
            var position = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
            this.position = position;
            var left = this.buffer.getChannelData(0);
            var right = this.dualChannel ? this.buffer.getChannelData(1) : this.buffer.getChannelData(0);
            var i = 0;
            for (; i < numFrames; i++) {
                target[i * 2] = left[i + position];
                target[i * 2 + 1] = right[i + position];
            }
            return Math.min(numFrames, left.length - position);
        }
    }, {
        key: "dualChannel",
        get: function get$$1() {
            return this.buffer.numberOfChannels > 1;
        }
    }, {
        key: "position",
        get: function get$$1() {
            return this._position;
        },
        set: function set$$1(value) {
            this._position = value;
        }
    }]);
    return WebAudioBufferSource;
}();

var getWebAudioNode = function getWebAudioNode(context, filter, bufferSize) {
    var BUFFER_SIZE = bufferSize || 4096;
    var node = context.createScriptProcessor(BUFFER_SIZE, 2, 2);
    var samples = new Float32Array(BUFFER_SIZE * 2);
    node.onaudioprocess = function (event) {
        var left = event.outputBuffer.getChannelData(0);
        var right = event.outputBuffer.getChannelData(1);
        var framesExtracted = filter.extract(samples, BUFFER_SIZE);
        if (framesExtracted === 0) {
            node.disconnect();
        }
        var i = 0;
        for (; i < framesExtracted; i++) {
            left[i] = samples[i * 2];
            right[i] = samples[i * 2 + 1];
        }
    };
    return node;
};

var pad = function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
};
var minsSecs = function minsSecs(secs) {
    var mins = Math.floor(secs / 60);
    var seconds = secs - mins * 60;
    return mins + ':' + pad(parseInt(seconds), 2);
};

var PitchShifter = function () {
    function PitchShifter(context, buffer, bufferSize) {
        classCallCheck(this, PitchShifter);
        this._soundtouch = new SoundTouch();
        var source = new WebAudioBufferSource(buffer);
        this._filter = new SimpleFilter(source, this._soundtouch, bufferSize);
        this._node = getWebAudioNode(context, this._filter);
        this.tempo = 1;
        this.rate = 1;
        this.duration = function () {
            return buffer.duration;
        };
        this.sampleRate = function () {
            return context.sampleRate;
        };
    }
    createClass(PitchShifter, [{
        key: 'connect',
        value: function connect(toNode) {
            this._node.connect(toNode);
        }
    }, {
        key: 'disconnect',
        value: function disconnect() {
            this._node.disconnect();
        }
    }, {
        key: 'formattedDuration',
        get: function get$$1() {
            var dur = this.duration() || 0;
            return minsSecs(dur);
        }
    }, {
        key: 'timePlayed',
        get: function get$$1() {
            return minsSecs(this._filter.sourcePosition / this.sampleRate());
        }
    }, {
        key: 'percentagePlayed',
        get: function get$$1() {
            var dur = this.duration() || 0;
            return 100 * this._filter.sourcePosition / (dur * this.sampleRate());
        },
        set: function set$$1(perc) {
            var dur = this.duration() || 0;
            this._filter.sourcePosition = parseInt(perc * dur * this.sampleRate());
        }
    }, {
        key: 'node',
        get: function get$$1() {
            return this._node;
        }
    }, {
        key: 'pitch',
        set: function set$$1(pitch) {
            this._soundtouch.pitch = pitch;
        }
    }, {
        key: 'pitchSemitones',
        set: function set$$1(semitone) {
            this._soundtouch.pitchSemitones = semitone;
        }
    }, {
        key: 'rate',
        set: function set$$1(rate) {
            this._soundtouch.rate = rate;
        }
    }, {
        key: 'tempo',
        set: function set$$1(tempo) {
            this._soundtouch.tempo = tempo;
        }
    }]);
    return PitchShifter;
}();

export { AbstractFifoSamplePipe, RateTransposer, SimpleFilter, Stretch, SoundTouch, WebAudioBufferSource, PitchShifter, getWebAudioNode };
//# sourceMappingURL=soundtouch.js.map
